import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Users, RefreshCw, AlertCircle, Check, User, KeyRound, Shield, ChevronDown, Pencil } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { listUsers, createUser, updateUser, resetUserPassword, User as Colaborador } from "../../services/usersService";
import { listTeams, getTeamMembers, addTeamMember, removeTeamMember, Team, TeamMember } from "../../services/teamsService";
import { listRoles, Role } from "../../services/rolesService";

/* ─── Glass Toggle ──────────────────────────────────────────────────────── */
function GlassToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="relative flex items-center flex-shrink-0"
      style={{ width: 36, height: 20, borderRadius: 10, background: value ? "linear-gradient(135deg, #ec4899, #7c3aed)" : "rgba(124,58,237,0.12)", border: value ? "none" : "1px solid rgba(124,58,237,0.2)", boxShadow: value ? "0 4px 12px rgba(124,58,237,0.35)" : "none", transition: "all 0.25s ease" }}>
      <div style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: value ? "white" : "#c4b5fd", left: value ? 20 : 2, boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.25s ease" }} />
    </button>
  );
}

/* ─── MultiSelectDropdown (com toggle) ─────────────────────────────────── */
function MultiSelectDropdown({ options, selectedIds, onChange, placeholder, isDark, t }: {
  options: { value: string; label: string }[]; selectedIds: string[]; onChange: (ids: string[]) => void; placeholder: string; isDark: boolean; t: any;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler); }, []);
  const toggle = (id: string) => { if (selectedIds.includes(id)) onChange(selectedIds.filter(v => v !== id)); else onChange([...selectedIds, id]); };
  const summary = selectedIds.length === 0 ? placeholder : `${selectedIds.length} selecionada(s)`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl outline-none text-sm"
        style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", color: selectedIds.length ? t.textPrimary : t.textMuted }}>
        <span className="truncate">{summary}</span><ChevronDown size={14} style={{ color: t.textMuted }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-2 py-2 rounded-xl shadow-2xl backdrop-blur-xl"
            style={{ background: isDark ? "rgba(24,10,50,0.95)" : "rgba(255,255,255,0.95)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", maxHeight: 220, overflowY: "auto" }}>
            {options.map(opt => (
              <div key={opt.value} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-purple-500/10 transition-colors cursor-pointer" onClick={() => toggle(opt.value)}>
                <span style={{ color: t.textPrimary }}>{opt.label}</span>
                <GlassToggle value={selectedIds.includes(opt.value)} onChange={() => {}} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── RoleSelectDropdown ───────────────────────────────────────────────── */
function RoleSelectDropdown({ teams, roles, selectedTeamIds, teamRoles, onChangeRole, isDark, t }: {
  teams: Team[]; roles: Role[]; selectedTeamIds: string[]; teamRoles: Record<string, string>; onChangeRole: (teamId: string, roleId: string) => void; isDark: boolean; t: any;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler); }, []);
  const selectedCount = Object.values(teamRoles).filter(Boolean).length;
  const summary = selectedTeamIds.length === 0 ? "Selecione equipes primeiro" : selectedCount === 0 ? "Selecione os cargos" : `${selectedCount} cargo(s) definido(s)`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl outline-none text-sm"
        style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", color: selectedCount ? t.textPrimary : t.textMuted }}>
        <span className="truncate">{summary}</span><ChevronDown size={14} style={{ color: t.textMuted }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-2 py-2 rounded-xl shadow-2xl backdrop-blur-xl"
            style={{ background: isDark ? "rgba(24,10,50,0.95)" : "rgba(255,255,255,0.95)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", maxHeight: 200, overflowY: "auto" }}>
            {selectedTeamIds.map(tid => {
              const team = teams.find(t => t.id === tid);
              const roleOpts = roles.filter(r => r.team_id === tid);
              const selectedRoleId = teamRoles[tid] || "";
              return (
                <div key={tid}>
                  <div style={{ padding: "4px 16px", fontSize: 11, color: t.textMuted, fontWeight: 600, textTransform: "uppercase" }}>{team?.name}</div>
                  {roleOpts.length === 0 ? <div style={{ padding: "4px 16px", fontSize: 12, color: t.textMuted }}>Nenhum cargo disponível</div> :
                    roleOpts.map(role => {
                      const isSelected = selectedRoleId === role.id;
                      return (
                        <div key={role.id} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-purple-500/10 transition-colors cursor-pointer" onClick={() => onChangeRole(tid, isSelected ? "" : role.id)}>
                          <span style={{ color: isSelected ? "#7c3aed" : t.textPrimary }}>{role.name}</span>
                          <GlassToggle value={isSelected} onChange={() => {}} />
                        </div>
                      );
                    })
                  }
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Glass Modal ────────────────────────────────────────────────────────── */
function GlassModal({ title, children, onClose, onSave, isDark, t, saving }: {
  title: string; children: React.ReactNode; onClose: () => void; onSave?: () => void; isDark: boolean; t: any; saving?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.3 }} className="w-full max-w-xl flex flex-col rounded-3xl overflow-hidden"
        style={{ maxHeight: "88vh", background: isDark ? "rgba(18,8,40,0.97)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.6)" : "0 24px 64px rgba(0,0,0,0.14)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>{title}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", color: t.textMuted }}><X size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">{children}</div>
        {onSave && (
          <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
            <button onClick={onClose} className="px-5 py-2 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", color: t.textSecondary }}>Cancelar</button>
            <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, #ec4899, #7c3aed)", border: "none", color: "white", fontWeight: 600, boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}><Check size={16} /> Salvar</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function UserManagement() {
  const { t, mode } = useTheme();
  const isDark = mode === "dark";
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<Colaborador[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create / Edit
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Colaborador | null>(null);
  const [form, setForm] = useState({
    name: "", username: "", email: "", password: "",
    selectedTeamIds: [] as string[],
    teamRoles: {} as Record<string, string>,
    scheduleDays: ["seg","ter","qua","qui","sex"], scheduleStart: "08:00", scheduleEnd: "18:00"
  });

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [u, t, r] = await Promise.all([listUsers(), listTeams(), listRoles()]);
      setUsers(u); setTeams(t); setRoles(r);
      const memMap: Record<string, TeamMember[]> = {};
      for (const team of t) memMap[team.id] = await getTeamMembers(team.id);
      setMembers(memMap);
    } catch { setError("Erro ao carregar dados."); } finally { setLoading(false); }
  };

  const openNewUser = () => {
    setEditingUser(null);
    setForm({ name: "", username: "", email: "", password: "", selectedTeamIds: [], teamRoles: {}, scheduleDays: ["seg","ter","qua","qui","sex"], scheduleStart: "08:00", scheduleEnd: "18:00" });
    setShowUserModal(true);
  };

  const openEditUser = (user: Colaborador) => {
    setEditingUser(user);
    const userTeams = teams.filter(t => members[t.id]?.some(m => m.userId === user.id));
    const selIds = userTeams.map(t => t.id);
    const rolesMap: Record<string, string> = {};
    userTeams.forEach(t => { const entry = members[t.id]?.find(m => m.userId === user.id); if (entry?.roleId) rolesMap[t.id] = entry.roleId; });
    const schedule = user.schedule ? JSON.parse(user.schedule) : { start: "08:00", end: "18:00", days: ["seg","ter","qua","qui","sex"] };
    setForm({
      name: user.name || "", username: user.username || "", email: user.email || "", password: "",
      selectedTeamIds: selIds, teamRoles: rolesMap,
      scheduleDays: schedule.days, scheduleStart: schedule.start, scheduleEnd: schedule.end,
    });
    setShowUserModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const schedule = JSON.stringify({ start: form.scheduleStart, end: form.scheduleEnd, days: form.scheduleDays });
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { name: form.name, username: form.username, email: form.email, schedule });
        // update memberships
        for (const t of teams) { if (members[t.id]?.some(m => m.userId === editingUser.id)) await removeTeamMember(t.id, editingUser.id); }
        for (const tid of form.selectedTeamIds) { await addTeamMember(tid, editingUser.id, form.teamRoles[tid] || undefined); }
      } else {
        const payload: any = { name: form.name, username: form.username, email: form.email, password: form.password, role: "agent", schedule };
        payload.teams = form.selectedTeamIds.map(tid => ({ teamId: tid, roleId: form.teamRoles[tid] || "" }));
        await createUser(payload);
      }
      setShowUserModal(false);
      setSuccess(editingUser ? "Colaborador atualizado!" : "Colaborador criado!");
      loadData();
    } catch { setError("Erro ao salvar colaborador."); }
    finally { setSaving(false); }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword.trim()) return;
    try { await resetUserPassword(userId, newPassword); setNewPassword(""); setResetUserId(null); setSuccess("Senha redefinida!"); }
    catch { setError("Erro ao redefinir senha."); }
  };

  if (currentUser?.role !== "admin" && currentUser?.role !== "super_admin") {
    return <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>Acesso restrito a administradores.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div className="flex items-center justify-between mb-5">
        <div><h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary }}>Colaboradores</h3><p style={{ fontSize: 13, color: t.textMuted }}>Gerencie os utilizadores da empresa</p></div>
        <button onClick={openNewUser} style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #ec4899, #7c3aed)", border: "none", color: "white", fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 12, cursor: "pointer" }}><Plus size={16} /> Novo Colaborador</button>
      </div>
      <AnimatePresence>
        {error && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{background:isDark?"rgba(239,68,68,0.1)":"#fef2f2",border:"1px solid rgba(239,68,68,0.2)"}}><AlertCircle size={14} color="#ef4444"/><span style={{fontSize:12,color:"#ef4444"}}>{error}</span></motion.div>}
        {success && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{background:isDark?"rgba(16,185,129,0.1)":"#ecfdf5",border:"1px solid rgba(16,185,129,0.2)"}}><Check size={14} color="#10b981"/><span style={{fontSize:12,color:"#10b981"}}>{success}</span></motion.div>}
      </AnimatePresence>

      {/* Tabela */}
      <div className="rounded-2xl overflow-hidden" style={{border:`1px solid ${t.borderStrong}`,background:isDark?"rgba(255,255,255,0.03)":"#fff"}}>
        <table className="w-full text-sm">
          <thead><tr style={{borderBottom:`1px solid ${t.borderStrong}`}}><th className="p-3 text-left" style={{color:t.textMuted}}>Nome</th><th className="p-3 text-left" style={{color:t.textMuted}}>Usuário</th><th className="p-3 text-left" style={{color:t.textMuted}}>Email</th><th className="p-3 text-left" style={{color:t.textMuted}}>Equipe</th><th className="p-3 text-left" style={{color:t.textMuted}}>Cargo</th><th className="p-3 text-center" style={{color:t.textMuted}}>Ações</th></tr></thead>
          <tbody>
            {users.map(u => {
              const userTeams = teams.filter(t => members[t.id]?.some(m => m.userId === u.id));
              const teamNames = userTeams.map(t => t.name).join(", ") || "-";
              const roleNames = userTeams.map(t => { const entry = members[t.id]?.find(m => m.userId === u.id); const r = roles.find(r => r.id === entry?.roleId); return r ? `${r.name} (${t.name})` : ""; }).filter(Boolean).join(", ") || "-";
              return (
                <tr key={u.id} style={{borderBottom:`1px solid ${t.borderStrong}`}}>
                  <td className="p-3" style={{color:t.textPrimary}}>{u.name||u.email}</td>
                  <td className="p-3" style={{color:t.textSecondary}}>{u.username||"-"}</td>
                  <td className="p-3" style={{color:t.textSecondary}}>{u.email||"-"}</td>
                  <td className="p-3" style={{color:t.textSecondary}}>{teamNames}</td>
                  <td className="p-3" style={{color:t.textSecondary}}>{roleNames}</td>
                  <td className="p-3 flex gap-2 justify-end">
                    <button onClick={() => openEditUser(u)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#3b82f6",color:"white"}}><Pencil size={12} /> Editar</button>
                    <button onClick={() => setResetUserId(u.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:"#f59e0b",color:"white"}}><KeyRound size={12} /> Reset Senha</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {showUserModal && (
          <GlassModal title={editingUser ? "Editar Colaborador" : "Novo Colaborador"} onClose={() => setShowUserModal(false)} onSave={handleSave} isDark={isDark} t={t} saving={saving}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{background:"linear-gradient(135deg, #7c3aed, #a855f7)"}}>{form.name ? form.name.split(" ").map(n=>n[0]?.toUpperCase()).slice(0,2).join("") : <User size={24} />}</div>
              <div className="flex-1"><input required placeholder="Nome completo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Usuário" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}} />
              <input type="email" placeholder="Email (opcional)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}} />
              {!editingUser && <input required type="password" placeholder="Senha" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}} />}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Equipes</label>
                <MultiSelectDropdown options={teams.map(t=>({value:t.id,label:t.name}))} selectedIds={form.selectedTeamIds}
                  onChange={ids => { const newRoles = {...form.teamRoles}; Object.keys(newRoles).forEach(tid => { if(!ids.includes(tid)) delete newRoles[tid]; }); setForm({...form, selectedTeamIds: ids, teamRoles: newRoles}); }}
                  placeholder="Selecione equipes" isDark={isDark} t={t} />
              </div>
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Cargos</label>
                <RoleSelectDropdown teams={teams} roles={roles} selectedTeamIds={form.selectedTeamIds} teamRoles={form.teamRoles}
                  onChangeRole={(tid, rid) => setForm({...form, teamRoles: {...form.teamRoles, [tid]: rid}})} isDark={isDark} t={t} />
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 flex items-center gap-1" style={{color:t.textMuted}}>Horário de atendimento</label>
              <div className="flex items-center gap-2 mb-2">
                <input type="time" value={form.scheduleStart} onChange={e => setForm({...form, scheduleStart: e.target.value})} className="px-6 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput,color:t.textPrimary,width:100}} />
                <span style={{color:t.textSecondary}}>até</span>
                <input type="time" value={form.scheduleEnd} onChange={e => setForm({...form, scheduleEnd: e.target.value})} className="px-6 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput,color:t.textPrimary,width:100}} />
                <div className="flex gap-2 flex-wrap ml-2">
                  {[{key:"seg",label:"Seg"},{key:"ter",label:"Ter"},{key:"qua",label:"Qua"},{key:"qui",label:"Qui"},{key:"sex",label:"Sex"},{key:"sab",label:"Sáb"},{key:"dom",label:"Dom"}].map(d => (
                    <button key={d.key} onClick={() => { const days = form.scheduleDays.includes(d.key) ? form.scheduleDays.filter(day => day !== d.key) : [...form.scheduleDays, d.key]; setForm({...form, scheduleDays: days}); }}
                      className={`px-1 py-2 rounded-md text-xs font-medium transition-all ${form.scheduleDays.includes(d.key) ? "bg-purple-600 text-white" : isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-500"}`}
                      style={{ border: form.scheduleDays.includes(d.key) ? "none" : `1px solid ${t.border}` }}>{d.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </GlassModal>
        )}
        {resetUserId && (
          <GlassModal title="Redefinir Senha" onClose={() => {setResetUserId(null); setNewPassword("");}} onSave={() => handleResetPassword(resetUserId!)} isDark={isDark} t={t}>
            <input type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput, color: t.textPrimary}} />
          </GlassModal>
        )}
      </AnimatePresence>
    </div>
  );
}
