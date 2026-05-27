import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, X, Users, RefreshCw, AlertCircle, Check, User, KeyRound, Shield, ChevronDown, ChevronUp, Clock, Camera, Pencil
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { listTeams, createTeam, deleteTeam, getTeamMembers, addTeamMember, removeTeamMember, Team, TeamMember } from "../../services/teamsService";
import { listUsers, createUser, updateUser, resetUserPassword, User as Colaborador } from "../../services/usersService";
import { listRoles, createRole, updateRole, deleteRole, Role } from "../../services/rolesService";
import { listConnections, WhatsAppSession } from "../../services/whatsappService";
import { usePlanFeatures } from "../../hooks/usePlanFeatures";

/* ─── Glass Toggle ──────────────────────────────────────────────────────── */
function GlassToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="relative flex items-center flex-shrink-0"
      style={{ width: 36, height: 20, borderRadius: 10, background: value ? "linear-gradient(135deg, #ec4899, #7c3aed)" : "rgba(124,58,237,0.12)", border: value ? "none" : "1px solid rgba(124,58,237,0.2)", boxShadow: value ? "0 4px 12px rgba(124,58,237,0.35)" : "none", transition: "all 0.25s ease" }}>
      <div style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: value ? "white" : "#c4b5fd", left: value ? 20 : 2, boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.25s ease" }} />
    </button>
  );
}

/* ─── MultiSelectDropdown ───────────────────────────────────────────────── */
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

/* ─── Constants ──────────────────────────────────────────────────────── */
const AVAILABLE_PERMISSIONS = [
  { key: "chat", label: "Chat" }, { key: "relatorios", label: "Relatórios" }, { key: "campanhas", label: "Campanhas" },
  { key: "configuracoes", label: "Configurações" }, { key: "admin", label: "Administração" }, { key: "exportar", label: "Exportar dados" },
  { key: "webhook", label: "Webhooks" },
];
const WEEKDAYS = [
  { key: "seg", label: "Seg" }, { key: "ter", label: "Ter" }, { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" }, { key: "sex", label: "Sex" }, { key: "sab", label: "Sáb" }, { key: "dom", label: "Dom" }
];

export function TeamManagement() {
  const { t, mode } = useTheme();
  const isDark = mode === "dark";
  const { features } = usePlanFeatures();

  const [activeTab, setActiveTab] = useState<"equipes" | "colaboradores">("equipes");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<Colaborador[]>([]);
  const [connections, setConnections] = useState<WhatsAppSession[]>([]);

  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  // Modal de criação de equipe
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    initialRoles: [{ name: "", permissions: [] as string[], allowedConnectionIds: [] as string[] }]
  });

  // Modal de criação de colaborador
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", username: "", email: "", password: "",
    selectedTeamIds: [] as string[],
    teamRoles: {} as Record<string, string>,
    scheduleDays: ["seg", "ter", "qua", "qui", "sex"],
    scheduleStart: "08:00", scheduleEnd: "18:00"
  });

  // Modal de edição de colaborador
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Colaborador | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", username: "", email: "",
    selectedTeamIds: [] as string[],
    teamRoles: {} as Record<string, string>,
    scheduleDays: ["seg", "ter", "qua", "qui", "sex"],
    scheduleStart: "08:00", scheduleEnd: "18:00"
  });

  // Modal de cargo (criar / editar)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", teamId: "", permissions: [] as string[] });

  // Reset de senha
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [t, u, r, c] = await Promise.all([listTeams(), listUsers(), listRoles(), listConnections()]);
      setTeams(t); setUsers(u); setRoles(r);
      setConnections(c.filter(conn => conn.status === "connected"));
      const memMap: Record<string, TeamMember[]> = {};
      for (const team of t) memMap[team.id] = await getTeamMembers(team.id);
      setMembers(memMap);
    } catch { setError("Erro ao carregar dados."); }
  };

  const toggleTeamExpanded = (teamId: string) => setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));

  // ---------- Equipes ----------
  const openNewTeam = () => {
    setTeamForm({ name: "", initialRoles: [{ name: "", permissions: [], allowedConnectionIds: [] }] });
    setShowTeamModal(true);
  };
  const handleSaveTeam = async () => {
    if (!teamForm.name.trim()) return; setSaving(true);
    try {
      const { id: teamId } = await createTeam(teamForm.name);
      for (const role of teamForm.initialRoles) { if (role.name.trim()) await createRole({ teamId, name: role.name, permissions: role.permissions }); }
      setShowTeamModal(false); setSuccess("Equipe criada!"); loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Erro ao salvar equipe."); }
    finally { setSaving(false); }
  };
  const handleDeleteTeam = async (id: string) => { if (confirm("Remover equipe?")) { await deleteTeam(id); loadData(); } };
  const handleRemoveMember = async (teamId: string, userId: string) => {
    if (confirm("Remover membro?")) { await removeTeamMember(teamId, userId); const up = await getTeamMembers(teamId); setMembers({...members, [teamId]: up}); }
  };

  // ---------- Cargos ----------
  const openAddRoleModal = (teamId: string) => {
    setEditingRole(null);
    setRoleForm({ name: "", teamId, permissions: [] });
    setShowRoleModal(true);
  };
  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, teamId: role.team_id, permissions: [...role.permissions] });
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim() || !roleForm.teamId) return;
    setSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, { name: roleForm.name, permissions: roleForm.permissions });
        setSuccess("Cargo atualizado!");
      } else {
        await createRole({ teamId: roleForm.teamId, name: roleForm.name, permissions: roleForm.permissions });
        setSuccess("Cargo criado!");
      }
      setShowRoleModal(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError("Erro ao salvar cargo."); }
    finally { setSaving(false); }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm("Remover cargo?")) { await deleteRole(roleId); loadData(); }
  };

  // ---------- Colaboradores ----------
  const openNewUserModal = () => {
    setNewUser({
      name: "", username: "", email: "", password: "",
      selectedTeamIds: [], teamRoles: {},
      scheduleDays: ["seg","ter","qua","qui","sex"], scheduleStart: "08:00", scheduleEnd: "18:00"
    });
    setShowUserModal(true);
  };

  const handleCreateUser = async () => {
    setSaving(true);
    const schedule = JSON.stringify({ start: newUser.scheduleStart, end: newUser.scheduleEnd, days: newUser.scheduleDays });
    const payload: any = { name: newUser.name, username: newUser.username, email: newUser.email, password: newUser.password, role: "agent", schedule };
    payload.teams = newUser.selectedTeamIds.map(tid => ({ teamId: tid, roleId: newUser.teamRoles[tid] || "" }));
    try { await createUser(payload); setShowUserModal(false); setSuccess("Colaborador criado!"); loadData(); }
    catch { setError("Erro ao criar colaborador."); } finally { setSaving(false); }
  };

  const openEditUserModal = (user: Colaborador) => {
    setEditingUser(user);
    const userTeams = teams.filter(t => members[t.id]?.some(m => m.userId === user.id));
    const selIds = userTeams.map(t => t.id);
    const rolesMap: Record<string, string> = {};
    userTeams.forEach(t => {
      const entry = members[t.id]?.find(m => m.userId === user.id);
      if (entry?.roleId) rolesMap[t.id] = entry.roleId;
    });
    const schedule = user.schedule ? JSON.parse(user.schedule) : { start: "08:00", end: "18:00", days: ["seg","ter","qua","qui","sex"] };
    setEditForm({
      name: user.name || "", username: user.username || "", email: user.email || "",
      selectedTeamIds: selIds, teamRoles: rolesMap,
      scheduleDays: schedule.days || ["seg","ter","qua","qui","sex"],
      scheduleStart: schedule.start || "08:00", scheduleEnd: schedule.end || "18:00",
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return; setSaving(true);
    const schedule = JSON.stringify({ start: editForm.scheduleStart, end: editForm.scheduleEnd, days: editForm.scheduleDays });
    try {
      await updateUser(editingUser.id, { name: editForm.name, username: editForm.username, email: editForm.email, schedule });
      for (const t of teams) { if (members[t.id]?.some(m => m.userId === editingUser.id)) await removeTeamMember(t.id, editingUser.id); }
      for (const tid of editForm.selectedTeamIds) {
        await addTeamMember(tid, editingUser.id, editForm.teamRoles[tid] || undefined);
      }
      setShowEditUserModal(false); setSuccess("Colaborador atualizado!"); loadData();
    } catch { setError("Erro ao atualizar colaborador."); } finally { setSaving(false); }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword.trim()) return;
    try { await resetUserPassword(userId, newPassword); setNewPassword(""); setResetUserId(null); setSuccess("Senha redefinida!"); }
    catch { setError("Erro ao redefinir senha."); }
  };

  const btnPrimary = {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #ec4899, #7c3aed)",
    border: "none", color: "white", fontSize: 13, fontWeight: 600,
    boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
    padding: "8px 18px", borderRadius: 12, cursor: "pointer",
  } as React.CSSProperties;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary }}>Equipes & Colaboradores</h3>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Gerencie equipes, membros e cargos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: isDark?"rgba(255,255,255,0.07)":"rgba(124,58,237,0.06)", border: `1px solid ${t.borderStrong}`, color: t.textSecondary }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="flex gap-0">
        {(["equipes","colaboradores"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-t-xl font-semibold text-sm"
            style={{
              background: activeTab===tab ? (isDark ? "rgba(255,255,255,0.07)" : "#fff") : "transparent",
              border: `1px solid ${activeTab===tab ? t.borderStrong : "transparent"}`,
              borderBottom: activeTab===tab ? "none" : `1px solid ${t.borderStrong}`,
              color: t.textPrimary,
            }}>
            {tab==="equipes"?"Equipes":"Colaboradores"}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {error && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{background:isDark?"rgba(239,68,68,0.1)":"#fef2f2",border:"1px solid rgba(239,68,68,0.2)"}}><AlertCircle size={14} color="#ef4444"/><span style={{fontSize:12,color:"#ef4444"}}>{error}</span></motion.div>}
        {success && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{background:isDark?"rgba(16,185,129,0.1)":"#ecfdf5",border:"1px solid rgba(16,185,129,0.2)"}}><Check size={14} color="#10b981"/><span style={{fontSize:12,color:"#10b981"}}>{success}</span></motion.div>}
      </AnimatePresence>

      {/* ABA EQUIPES */}
      {activeTab==="equipes" && (
        <>
          <div className="flex gap-2"><button onClick={openNewTeam} style={btnPrimary}><Plus size={16} /> Nova Equipe</button></div>
          <div className="flex flex-col gap-3">
            {teams.map(team => {
              const teamMembers = members[team.id] || [];
              const teamRoles = roles.filter(r => r.team_id === team.id);
              const expanded = expandedTeams[team.id] || false;
              return (
                <motion.div key={team.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="px-5 py-4 rounded-2xl"
                  style={{ background: isDark?"rgba(255,255,255,0.03)":"#fff", border: isDark?"1px solid rgba(255,255,255,0.07)":"1px solid #e5e7eb", boxShadow: isDark?"none":"0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(124,58,237,0.18))", border: isDark?"1px solid rgba(139,92,246,0.25)":"1px solid #ede9fe" }}><Users size={20} color="#8b5cf6"/></div>
                    <div className="flex-1"><div className="flex items-center gap-2"><span style={{ fontSize:14,fontWeight:600,color:t.textPrimary }}>{team.name}</span><span className="px-2 py-0.5 rounded-full" style={{ fontSize:10,fontWeight:600,background:isDark?"rgba(124,58,237,0.2)":"#ede9fe",border:isDark?"1px solid rgba(124,58,237,0.3)":"1px solid #ddd6fe",color:"#7c3aed"}}>{teamMembers.length} membros</span><span className="px-2 py-0.5 rounded-full" style={{ fontSize:10,fontWeight:600,background:isDark?"rgba(16,185,129,0.15)":"#ecfdf5",border:isDark?"1px solid rgba(16,185,129,0.2)":"1px solid #a7f3d0",color:"#10b981"}}>{teamRoles.length} cargos</span></div></div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleTeamExpanded(team.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:isDark?"rgba(255,255,255,0.05)":"#f3f4f6",border:isDark?"1px solid rgba(255,255,255,0.08)":"1px solid #e5e7eb",color:t.textSecondary }}>{expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
                      <button onClick={() => openAddRoleModal(team.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:isDark?"rgba(16,185,129,0.12)":"#ecfdf5",border:isDark?"1px solid rgba(16,185,129,0.2)":"1px solid #a7f3d0",color:"#10b981" }}><Shield size={13}/></button>
                      <button onClick={() => handleDeleteTeam(team.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:isDark?"rgba(239,68,68,0.1)":"#fef2f2",border:isDark?"1px solid rgba(239,68,68,0.2)":"1px solid #fecaca",color:"#ef4444" }}><Trash2 size={13}/></button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} style={{overflow:"hidden"}}>
                        <div className="mt-4 pt-4 flex flex-col gap-4" style={{ borderTop:isDark?"1px solid rgba(255,255,255,0.06)":"1px solid #e5e7eb" }}>
                          <div>
                            <div className="flex items-center justify-between mb-2"><span style={{fontSize:13,fontWeight:600,color:t.textSecondary}}>Membros</span></div>
                            {teamMembers.length===0?<span style={{fontSize:12,color:t.textMuted}}>Nenhum membro ainda.</span>:<div className="flex flex-col gap-1">{teamMembers.map(m=><div key={m.userId} className="flex items-center justify-between py-1 px-3 rounded-lg" style={{background:isDark?"rgba(255,255,255,0.03)":"#f9fafb"}}><span style={{fontSize:13,color:t.textPrimary}}>{m.name||m.email||m.userId}</span><button onClick={()=>handleRemoveMember(team.id,m.userId)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:isDark?"rgba(239,68,68,0.12)":"#fef2f2",border:isDark?"1px solid rgba(239,68,68,0.2)":"1px solid #fecaca",color:"#ef4444"}}><X size={12}/></button></div>)}</div>}
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2"><span style={{fontSize:13,fontWeight:600,color:t.textSecondary}}>Cargos</span></div>
                            {teamRoles.length===0?<span style={{fontSize:12,color:t.textMuted}}>Nenhum cargo definido.</span>:<div className="flex flex-col gap-1">{teamRoles.map(role=><div key={role.id} className="flex items-center justify-between py-1 px-3 rounded-lg" style={{background:isDark?"rgba(255,255,255,0.03)":"#f9fafb"}}><div className="flex items-center gap-2"><Shield size={12} color="#7c3aed"/><span style={{fontSize:13,color:t.textPrimary}}>{role.name}</span><span style={{fontSize:11,color:t.textMuted}}>{(role.permissions||[]).join(", ")||"sem permissões"}</span></div><div className="flex gap-1"><button onClick={() => openEditRoleModal(role)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:isDark?"rgba(16,185,129,0.30)":"#ecfdf5",color:"#10b981"}}><Pencil size={12}/></button><button onClick={()=>handleDeleteRole(role.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:isDark?"rgba(239,68,68,0.12)":"#fef2f2",border:isDark?"1px solid rgba(239,68,68,0.2)":"1px solid #fecaca",color:"#ef4444"}}><Trash2 size={12}/></button></div></div>)}</div>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ABA COLABORADORES */}
      {activeTab==="colaboradores" && (
        <>
          <div className="flex gap-2"><button onClick={openNewUserModal} style={btnPrimary}><Plus size={16} /> Novo Colaborador</button></div>
          <div className="rounded-2xl overflow-hidden" style={{border:`1px solid ${t.borderStrong}`,background:isDark?"rgba(255,255,255,0.03)":"#fff"}}>
            <table className="w-full text-sm">
              <thead><tr style={{borderBottom:`1px solid ${t.borderStrong}`}}><th className="p-3 text-left" style={{color:t.textMuted}}>Nome</th><th className="p-3 text-left" style={{color:t.textMuted}}>Usuário</th><th className="p-3 text-left" style={{color:t.textMuted}}>Equipe</th><th className="p-3 text-left" style={{color:t.textMuted}}>Cargo</th><th className="p-3 text-center" style={{color:t.textMuted}}>Ações</th></tr></thead>
              <tbody>
                {users.map(u=>{
                  const userTeams = teams.filter(t => members[t.id]?.some(m => m.userId === u.id));
                  const teamNames = userTeams.map(t => t.name).join(", ") || "-";
                  const roleNames = userTeams.map(t => { const entry = members[t.id]?.find(m => m.userId === u.id); const r = roles.find(r => r.id === entry?.roleId); return r ? `${r.name} (${t.name})` : ""; }).filter(Boolean).join(", ") || "-";
                  return (
                    <tr key={u.id} style={{borderBottom:`1px solid ${t.borderStrong}`}}>
                      <td className="p-3" style={{color:t.textPrimary}}>{u.name||u.email}</td>
                      <td className="p-3" style={{color:t.textSecondary}}>{u.username||"-"}</td>
                      <td className="p-3" style={{color:t.textSecondary}}>{teamNames}</td>
                      <td className="p-3" style={{color:t.textSecondary}}>{roleNames}</td>
                      <td className="p-3 flex gap-2 justify-end">
                        <button onClick={()=>setResetUserId(u.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:isDark?"rgba(245,158,11,0.30)":"rgba(245,158,11,0.12)",border:isDark?"1px solid rgba(245,158,11,0.4)":"1px solid rgba(245,158,11,0.2)",color:"#f59e0b"}}><KeyRound size={12} /> Reset Senha</button>
                        <button onClick={() => openEditUserModal(u)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{background:isDark?"rgba(16,185,129,0.30)":"#ecfdf5",border:isDark?"1px solid rgba(16,185,129,0.4)":"1px solid #a7f3d0",color:"#10b981"}}><Pencil size={12} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showTeamModal && (
          <GlassModal title="Nova Equipe" onClose={() => setShowTeamModal(false)} onSave={handleSaveTeam} isDark={isDark} t={t} saving={saving}>
            <input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} placeholder="Nome da equipe" className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput, color: t.textPrimary}}/>
            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-xs" style={{color: t.textMuted}}>Cargos iniciais</label><button onClick={() => setTeamForm({...teamForm, initialRoles: [...teamForm.initialRoles, {name:"", permissions:[], allowedConnectionIds:[]}]})} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold" style={{background:"#7c3aed",color:"white"}}><Plus size={12}/> Adicionar cargo</button></div>
              <div className="max-h-60 overflow-y-auto pr-1 space-y-3">
                {teamForm.initialRoles.map((role, idx) => (
                  <div key={idx} className="p-3 rounded-xl" style={{background:isDark?"rgba(255,255,255,0.04)":"#f9fafb"}}>
                    <div className="flex gap-2 mb-2"><input value={role.name} onChange={e => { const nr = [...teamForm.initialRoles]; nr[idx].name = e.target.value; setTeamForm({...teamForm, initialRoles: nr}); }} placeholder="Nome do cargo" className="flex-1 px-3 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput, color: t.textPrimary}}/><button onClick={() => setTeamForm({...teamForm, initialRoles: teamForm.initialRoles.filter((_,i)=>i!==idx)})} className="text-red-500"><X size={14}/></button></div>
                    <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Permissões</label>
                    <div className="flex flex-wrap gap-3 mb-3">{AVAILABLE_PERMISSIONS.map(perm=><div key={perm.key} className="flex items-center gap-2"><GlassToggle value={role.permissions.includes(perm.key)} onChange={checked=>{const nr=[...teamForm.initialRoles];if(checked)nr[idx].permissions=[...nr[idx].permissions,perm.key];else nr[idx].permissions=nr[idx].permissions.filter(p=>p!==perm.key);setTeamForm({...teamForm,initialRoles:nr});}}/><span style={{fontSize:12,color:t.textSecondary}}>{perm.label}</span></div>)}</div>
                    <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Conexões WhatsApp</label>
                    <div className="flex flex-wrap gap-3">{connections.map(conn=><div key={conn.id} className="flex items-center gap-2"><GlassToggle value={role.allowedConnectionIds?.includes(conn.id)} onChange={checked=>{const nr=[...teamForm.initialRoles];if(checked)nr[idx].allowedConnectionIds=[...(nr[idx].allowedConnectionIds||[]),conn.id];else nr[idx].allowedConnectionIds=(nr[idx].allowedConnectionIds||[]).filter(id=>id!==conn.id);setTeamForm({...teamForm,initialRoles:nr});}}/><span style={{fontSize:12,color:t.textSecondary}}>{conn.name} ({conn.number})</span></div>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassModal>
        )}

        {showUserModal && (
          <GlassModal title="Novo Colaborador" onClose={() => setShowUserModal(false)} onSave={handleCreateUser} isDark={isDark} t={t} saving={saving}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{background:"linear-gradient(135deg, #7c3aed, #a855f7)",border:isDark?"2px solid rgba(255,255,255,0.2)":"2px solid #ede9fe"}}>{newUser.name?newUser.name.split(" ").map(n=>n[0]?.toUpperCase()).slice(0,2).join(""):<User size={24}/>}</div>
                <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center" style={{background:"#7c3aed",color:"white",border:"2px solid white"}}><Camera size={10}/></button>
              </div>
              <div className="flex-1"><input required placeholder="Nome completo" value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})} className="w-full px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Usuário" value={newUser.username} onChange={e=>setNewUser({...newUser,username:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
              <input type="email" placeholder="Email (opcional)" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
              <input required type="password" placeholder="Senha" value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Equipes</label>
                <MultiSelectDropdown options={teams.map(t=>({value:t.id,label:t.name}))} selectedIds={newUser.selectedTeamIds}
                  onChange={ids => { const newRoles = {...newUser.teamRoles}; Object.keys(newRoles).forEach(tid => { if(!ids.includes(tid)) delete newRoles[tid]; }); setNewUser({...newUser, selectedTeamIds: ids, teamRoles: newRoles}); }}
                  placeholder="Selecione equipes" isDark={isDark} t={t} />
              </div>
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Cargos</label>
                <RoleSelectDropdown teams={teams} roles={roles} selectedTeamIds={newUser.selectedTeamIds} teamRoles={newUser.teamRoles}
                  onChangeRole={(tid, rid) => setNewUser({...newUser, teamRoles: {...newUser.teamRoles, [tid]: rid}})} isDark={isDark} t={t} />
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 flex items-center gap-1" style={{color:t.textMuted}}><Clock size={12}/> Horário de atendimento</label>
              <div className="flex items-center gap-2 mb-2">
                <input type="time" value={newUser.scheduleStart} onChange={e=>setNewUser({...newUser,scheduleStart:e.target.value})} className="px-6 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput,color:t.textPrimary,width:100}}/>
                <span style={{color:t.textSecondary}}>até</span>
                <input type="time" value={newUser.scheduleEnd} onChange={e=>setNewUser({...newUser,scheduleEnd:e.target.value})} className="px-6 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput,color:t.textPrimary,width:100}}/>
                <div className="flex gap-2 flex-wrap ml-2">
                  {WEEKDAYS.map(d=><button key={d.key} onClick={()=>{const days=newUser.scheduleDays.includes(d.key)?newUser.scheduleDays.filter(day=>day!==d.key):[...newUser.scheduleDays,d.key];setNewUser({...newUser,scheduleDays:days});}} className={`px-1 py-2 rounded-md text-xs font-medium transition-all ${newUser.scheduleDays.includes(d.key)?"bg-purple-600 text-white":isDark?"bg-white/10 text-white/60":"bg-gray-100 text-gray-500"}`} style={{border:newUser.scheduleDays.includes(d.key)?"none":`1px solid ${t.border}`}}>{d.label}</button>)}
                </div>
              </div>
            </div>
          </GlassModal>
        )}

        {showEditUserModal && editingUser && (
          <GlassModal title="Editar Colaborador" onClose={() => setShowEditUserModal(false)} onSave={handleUpdateUser} isDark={isDark} t={t} saving={saving}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{background:"linear-gradient(135deg, #7c3aed, #a855f7)",border:isDark?"2px solid rgba(255,255,255,0.2)":"2px solid #ede9fe"}}>{editForm.name?editForm.name.split(" ").map(n=>n[0]?.toUpperCase()).slice(0,2).join(""):<User size={24}/>}</div>
              </div>
              <div className="flex-1"><input required placeholder="Nome completo" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} className="w-full px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Usuário" value={editForm.username} onChange={e=>setEditForm({...editForm,username:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
              <input type="email" placeholder="Email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput,color:t.textPrimary}}/>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Equipes</label>
                <MultiSelectDropdown options={teams.map(t=>({value:t.id,label:t.name}))} selectedIds={editForm.selectedTeamIds}
                  onChange={ids => { const newRoles = {...editForm.teamRoles}; Object.keys(newRoles).forEach(tid => { if(!ids.includes(tid)) delete newRoles[tid]; }); setEditForm({...editForm, selectedTeamIds: ids, teamRoles: newRoles}); }}
                  placeholder="Selecione equipes" isDark={isDark} t={t} />
              </div>
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{color:t.textMuted}}>Cargos</label>
                <RoleSelectDropdown teams={teams} roles={roles} selectedTeamIds={editForm.selectedTeamIds} teamRoles={editForm.teamRoles}
                  onChangeRole={(tid, rid) => setEditForm({...editForm, teamRoles: {...editForm.teamRoles, [tid]: rid}})} isDark={isDark} t={t} />
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 flex items-center gap-1" style={{color:t.textMuted}}><Clock size={12}/> Horário de atendimento</label>
              <div className="flex items-center gap-2 mb-2">
                <input type="time" value={editForm.scheduleStart} onChange={e=>setEditForm({...editForm,scheduleStart:e.target.value})} className="px-6 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput,color:t.textPrimary,width:100}}/>
                <span style={{color:t.textSecondary}}>até</span>
                <input type="time" value={editForm.scheduleEnd} onChange={e=>setEditForm({...editForm,scheduleEnd:e.target.value})} className="px-6 py-1.5 rounded-lg outline-none text-sm" style={{...t.panelInput,color:t.textPrimary,width:100}}/>
                <div className="flex gap-2 flex-wrap ml-2">
                  {WEEKDAYS.map(d=><button key={d.key} onClick={()=>{const days=editForm.scheduleDays.includes(d.key)?editForm.scheduleDays.filter(day=>day!==d.key):[...editForm.scheduleDays,d.key];setEditForm({...editForm,scheduleDays:days});}} className={`px-1 py-2 rounded-md text-xs font-medium transition-all ${editForm.scheduleDays.includes(d.key)?"bg-purple-600 text-white":isDark?"bg-white/10 text-white/60":"bg-gray-100 text-gray-500"}`} style={{border:editForm.scheduleDays.includes(d.key)?"none":`1px solid ${t.border}`}}>{d.label}</button>)}
                </div>
              </div>
            </div>
          </GlassModal>
        )}

        {showRoleModal && (
          <GlassModal title={editingRole ? "Editar Cargo" : "Novo Cargo"} onClose={() => setShowRoleModal(false)} onSave={handleSaveRole} isDark={isDark} t={t} saving={saving}>
            <input value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} placeholder="Nome do cargo" className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput, color: t.textPrimary}}/>
            <div>
              <label className="text-xs mb-2 block" style={{color:t.textMuted}}>Permissões</label>
              <div className="flex flex-wrap gap-3">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <div key={perm.key} className="flex items-center gap-2">
                    <GlassToggle value={roleForm.permissions.includes(perm.key)} onChange={checked => {
                      if (checked) setRoleForm({...roleForm, permissions: [...roleForm.permissions, perm.key]});
                      else setRoleForm({...roleForm, permissions: roleForm.permissions.filter(p => p !== perm.key)});
                    }} />
                    <span style={{ fontSize: 12, color: t.textSecondary }}>{perm.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassModal>
        )}

        {resetUserId && (
          <GlassModal title="Redefinir Senha" onClose={() => {setResetUserId(null); setNewPassword("");}} onSave={() => handleResetPassword(resetUserId!)} isDark={isDark} t={t}>
            <input type="password" placeholder="Nova senha" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="px-4 py-2.5 rounded-xl outline-none" style={{...t.panelInput, color: t.textPrimary}}/>
          </GlassModal>
        )}
      </AnimatePresence>
    </div>
  );
}
