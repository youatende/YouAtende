import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Filter, Mail, Phone, MessageCircle,
  MoreVertical, Star, Download, Upload, Loader2,
  AlertCircle, X, Check, Trash2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  listContacts, createContact, deleteContact,
  Contact,
} from "../../services/contactsService";

/* ── Helpers ── */
const COLORS = ["#7c3aed","#ec4899","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#d946ef"];
const getColor = (id: number) => COLORS[id % COLORS.length];
const getInit  = (name: string) => name.split(" ").slice(0,2).map(n=>n[0]?.toUpperCase()||"").join("");

/* ── Mock data ── */
type UiContact = {
  id: number; name: string; phone: string; email: string; tags: string[];
  initials: string; color: string; tickets: number; lastContact: string; starred: boolean;
};
const mockContacts: UiContact[] = [
  { id:1, name:"João Neves da Silva",   phone:"+55 11 99999-1234", email:"joao.neves@email.com",     tags:["Cliente VIP","Ativo"],      initials:"JN", color:"#7c3aed", tickets:8,  lastContact:"01/04/2026", starred:true  },
  { id:2, name:"Maria Fernanda Costa",  phone:"+55 21 98888-5678", email:"maria.costa@email.com",     tags:["Prospect"],                 initials:"MF", color:"#ec4899", tickets:3,  lastContact:"31/03/2026", starred:false },
  { id:3, name:"Carlos Eduardo Lima",   phone:"+55 31 97777-9012", email:"carlos.lima@email.com",     tags:["Cliente","Suporte"],        initials:"CE", color:"#0ea5e9", tickets:12, lastContact:"30/03/2026", starred:true  },
  { id:4, name:"Ana Luíza Rodrigues",   phone:"+55 41 96666-3456", email:"ana.rodrigues@email.com",   tags:["Inativo"],                  initials:"AL", color:"#10b981", tickets:1,  lastContact:"28/03/2026", starred:false },
  { id:5, name:"Roberto Almeida",       phone:"+55 51 95555-7890", email:"roberto.almeida@email.com", tags:["Cliente","Ativo"],          initials:"RA", color:"#f59e0b", tickets:5,  lastContact:"27/03/2026", starred:false },
  { id:6, name:"Juliana Mendes",        phone:"+55 61 94444-2345", email:"juliana.mendes@email.com",  tags:["VIP","Financeiro"],         initials:"JM", color:"#ef4444", tickets:9,  lastContact:"26/03/2026", starred:true  },
  { id:7, name:"Fernando Gomes",        phone:"+55 71 93333-6789", email:"fernando.gomes@email.com",  tags:["Prospect","Vendas"],        initials:"FG", color:"#8b5cf6", tickets:0,  lastContact:"25/03/2026", starred:false },
  { id:8, name:"Patrícia Souza",        phone:"+55 81 92222-0123", email:"patricia.souza@email.com",  tags:["Cliente"],                  initials:"PS", color:"#d946ef", tickets:4,  lastContact:"24/03/2026", starred:false },
];

function adaptContact(c: Contact): UiContact {
  return {
    id:          c.id,
    name:        c.name,
    phone:       c.number || "",
    email:       c.email || "",
    tags:        [],
    initials:    getInit(c.name),
    color:       getColor(c.id),
    tickets:     c.tickets?.length || 0,
    lastContact: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("pt-BR") : "—",
    starred:     false,
  };
}

/* ── New Contact Modal ── */
function NewContactModal({ onClose, onSave, t, isDark }: {
  onClose: () => void; onSave: (data:{name:string;number:string;email:string}) => void; t:any; isDark:boolean;
}) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Nome é obrigatório."); return; }
    if (!number.trim()) { setError("Número é obrigatório."); return; }
    onSave({ name: name.trim(), number: number.trim(), email: email.trim() });
  };

  const inputStyle = { ...t.panelInput, color: t.textPrimary, fontSize: 13 };
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:20, scale:0.97 }} transition={{ duration:0.28, ease:[0.25,0.46,0.45,0.94] }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background:isDark?"rgba(18,8,40,0.97)":"#fff", border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid #e5e7eb",
          boxShadow:isDark?"0 32px 80px rgba(0,0,0,0.6)":"0 24px 64px rgba(0,0,0,0.14)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom:isDark?"1px solid rgba(255,255,255,0.07)":"1px solid #e5e7eb" }}>
          <span style={{ fontSize:15, fontWeight:700, color:t.textPrimary }}>Novo Contato</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background:isDark?"rgba(255,255,255,0.06)":"#f3f4f6", border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid #e5e7eb", color:t.textMuted }}>
            <X size={14}/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {["Nome","Número","E-mail"].map((label, i) => (
            <div key={label}>
              <label className="block mb-1.5" style={{ fontSize:12, color:t.textMuted, fontWeight:500 }}>{label}</label>
              <input
                required={i<2}
                value={[name,number,email][i]}
                onChange={e => [setName,setNumber,setEmail][i](e.target.value)}
                placeholder={["João Silva","+55 11 99999-0000","joao@email.com"][i]}
                className="w-full px-4 py-2.5 rounded-xl outline-none"
                style={inputStyle}/>
            </div>
          ))}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={13} style={{ color:"#ef4444" }}/>
              <span style={{ fontSize:12, color:"#ef4444" }}>{error}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl"
              style={{ background:isDark?"rgba(255,255,255,0.06)":"#f3f4f6", border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid #e5e7eb", fontSize:13, color:t.textSecondary }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl"
              style={{ background:"linear-gradient(135deg,#ec4899,#7c3aed)", border:"none", fontSize:13, fontWeight:600, color:"white", boxShadow:"0 4px 16px rgba(124,58,237,0.35)" }}>
              <Check size={14}/> Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function Contatos() {
  const { t, mode } = useTheme();
  const { isDemo } = useAuth();
  const isDark = mode === "dark";

  const [contacts, setContacts]     = useState<UiContact[]>(mockContacts);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string|null>(null);
  const [showNew, setShowNew]       = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore]       = useState(false);

  const load = useCallback(async (page = 1, append = false) => {
    if (isDemo) { setContacts(mockContacts); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await listContacts(search, page);
      const adapted = res.contacts.map(adaptContact);
      setContacts(prev => append ? [...prev, ...adapted] : adapted);
      setHasMore(res.hasMore);
      setPageNumber(page);
    } catch {
      setError("Não foi possível carregar os contatos.");
      if (!append) setContacts(mockContacts);
    } finally {
      setLoading(false);
    }
  }, [isDemo, search]);

  useEffect(() => { load(1, false); }, [load]);

  const toggleStar = (id: number) => setContacts(cs => cs.map(c => c.id===id?{...c,starred:!c.starred}:c));

  const handleDelete = async (id: number) => {
    setContacts(cs => cs.filter(c => c.id !== id));
    if (!isDemo) {
      try { await deleteContact(id); } catch { load(1, false); }
    }
  };

  const handleCreate = async (data: { name:string; number:string; email:string }) => {
    setShowNew(false);
    if (isDemo) {
      const newC: UiContact = { id:Date.now(), ...data, phone:data.number, tags:[], initials:getInit(data.name), color:getColor(Date.now()), tickets:0, lastContact:"Hoje", starred:false };
      setContacts(prev => [newC, ...prev]);
      return;
    }
    try {
      const c = await createContact({ name:data.name, number:data.number, email:data.email });
      setContacts(prev => [adaptContact(c), ...prev]);
    } catch { setError("Erro ao criar contato."); }
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const btnGhost  = { background:isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.06)", border:`1px solid ${t.borderStrong}`, color:t.textSecondary, fontSize:13 } as React.CSSProperties;
  const btnPrimary = { background:"linear-gradient(135deg,#ec4899,#7c3aed)", border:"none", color:"white", fontSize:13, boxShadow:"0 4px 16px rgba(124,58,237,0.35)" } as React.CSSProperties;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={t.panel}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:t.divider }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, color:t.textPrimary }}>Contatos</h2>
          <p style={{ fontSize:13, color:t.textSecondary }}>{filtered.length} contatos encontrados</p>
        </div>
        <div className="flex items-center gap-2">
          {[{ icon:Upload, label:"Importar" },{ icon:Download, label:"Exportar" }].map(({ icon:Icon, label }) => (
            <button key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105" style={btnGhost}>
              <Icon size={14}/><span>{label}</span>
            </button>
          ))}
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105" style={btnPrimary}>
            <Plus size={14}/><span>Novo Contato</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={t.panelInput}>
          <Search size={15} style={{ color:t.textMuted }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize:13, color:t.textPrimary }}/>
          {search && <button onClick={()=>setSearch("")} style={{ color:t.textMuted }}><X size={13}/></button>}
        </div>
        <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={btnGhost}>
          <Filter size={14}/><span>Filtrar</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background:isDark?"rgba(239,68,68,0.1)":"#fef2f2", border:"1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={13} style={{ color:"#ef4444", flexShrink:0 }}/>
          <span style={{ fontSize:12, color:"#ef4444" }}>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-glass">
        {/* Header Row */}
        <div className="grid sticky top-0 mb-1"
          style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 60px", gap:12, padding:"8px 12px",
            borderRadius:10, background:isDark?"rgba(15,3,40,0.6)":"rgba(124,58,237,0.05)",
            backdropFilter:"blur(12px)", fontSize:11, fontWeight:600, color:t.textMuted,
            textTransform:"uppercase", letterSpacing:"0.06em" }}>
          <span>Contato</span><span>Telefone</span><span>E-mail</span><span>Tags</span><span>Tickets</span><span>Ações</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} style={{ color:"#7c3aed", animation:"spin 1s linear infinite" }}/>
          </div>
        )}

        {/* Rows */}
        {!loading && (
          <div className="flex flex-col gap-1.5">
            <AnimatePresence>
              {filtered.map((contact, i) => (
                <motion.div key={contact.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ delay:i*0.025 }}
                  className="grid items-center py-3 px-3 rounded-xl cursor-pointer transition-all"
                  style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 60px", gap:12,
                    background:isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.6)", border:`1px solid ${t.border}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background=isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.04)"; (e.currentTarget as HTMLElement).style.border=`1px solid ${t.borderStrong}`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.6)"; (e.currentTarget as HTMLElement).style.border=`1px solid ${t.border}`; }}>
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ background:`linear-gradient(135deg,${contact.color}88,${contact.color}cc)`, border:`1.5px solid ${t.avatarBorder}`, fontSize:12, fontWeight:700 }}>
                      {contact.initials}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:t.textPrimary }}>{contact.name}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>Último contato: {contact.lastContact}</div>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-center gap-1.5" style={{ fontSize:13, color:t.textSecondary }}>
                    <Phone size={12} style={{ color:"#7c3aed", opacity:0.6 }}/>{contact.phone}
                  </div>
                  {/* Email */}
                  <div className="flex items-center gap-1.5 truncate" style={{ fontSize:12, color:t.textSecondary }}>
                    <Mail size={12} style={{ color:"#ec4899", opacity:0.6, flexShrink:0 }}/>
                    <span className="truncate">{contact.email}</span>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0,2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full"
                        style={{ fontSize:10, fontWeight:500, background:t.tagBg, border:`1px solid ${t.tagBorder}`, color:t.tagColor }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Tickets */}
                  <div className="flex items-center gap-1.5" style={{ fontSize:13, color:t.textSecondary }}>
                    <MessageCircle size={12} style={{ color:"#7c3aed", opacity:0.6 }}/>{contact.tickets}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button onClick={e=>{e.stopPropagation();toggleStar(contact.id);}} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color:contact.starred?"#f59e0b":t.textMuted }}>
                      <Star size={13} fill={contact.starred?"#f59e0b":"none"}/>
                    </button>
                    <button onClick={e=>{e.stopPropagation();handleDelete(contact.id);}} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color:"#ef4444" }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load more */}
            {hasMore && !loading && (
              <button onClick={() => load(pageNumber+1, true)}
                className="mt-2 w-full py-2.5 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background:isDark?"rgba(255,255,255,0.06)":"#f3f4f6", border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid #e5e7eb", fontSize:13, color:t.textSecondary }}>
                Carregar mais
              </button>
            )}
          </div>
        )}
      </div>

      {/* New contact modal */}
      <AnimatePresence>
        {showNew && <NewContactModal onClose={()=>setShowNew(false)} onSave={handleCreate} t={t} isDark={isDark}/>}
      </AnimatePresence>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
