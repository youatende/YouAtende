import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, Smartphone, Zap, MessageCircle, Link, ChevronDown } from "lucide-react";
import { AccordionSection } from "./shared/AccordionSection";
import { FieldLabel } from "./shared/FieldLabel";
import { StyledInput } from "./shared/StyledInput";
import { StyledTextarea } from "./shared/StyledTextarea";
import { GlassToggle } from "./shared/GlassToggle";

interface WaChannel {
  id: string;
  name: string;
  phone: string;
  status: "connected" | "disconnected" | "pending";
  lastUpdate: string;
  default: boolean;
  typing: boolean;
  recording: boolean;
  token: string;
  msgInactivity: string;
  msgConclusion: string;
  msgOutOfHours: string;
  integration: string;
}

interface WaModalProps {
  channel: WaChannel | null;
  onClose: () => void;
  onSave: (ch: WaChannel) => void;
  t: any;
  isDark: boolean;
}

export function WaModal({ channel, onClose, onSave, t, isDark }: WaModalProps) {
  const isNew = !channel;
  const empty: WaChannel = {
    id: String(Date.now()), name: "", phone: "", status: "pending",
    lastUpdate: "", default: false, typing: false, recording: false,
    token: "", msgInactivity: "", msgConclusion: "", msgOutOfHours: "", integration: "",
  };
  const [form, setForm] = useState<WaChannel>(channel ?? empty);
  const set = (key: keyof WaChannel, val: any) => setForm(f => ({ ...f, [key]: val }));
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: isDark ? "rgba(18,8,40,0.97)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
          boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.6)" : "0 24px 64px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, rgba(37,211,102,0.2), rgba(124,58,237,0.2))",
              border: isDark ? "1px solid rgba(37,211,102,0.3)" : "1px solid #d1fae5",
            }}>
              <Smartphone size={17} style={{ color: "#25D366" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>{isNew ? "Nova Conexão WhatsApp" : "Editar WhatsApp"}</span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", color: t.textMuted }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-glass flex flex-col gap-4">
          <div>
            <FieldLabel t={t}>Nome do Canal</FieldLabel>
            <StyledInput value={form.name} onChange={v => set("name", v)} placeholder="Ex: API Oficial – Suporte" t={t} />
          </div>

          <AccordionSection title="Configurações" icon={Zap}
            open={openAccordion === "config"}
            onToggle={() => setOpenAccordion(openAccordion === "config" ? null : "config")}
            t={t} isDark={isDark}>
            <div className="flex items-center gap-6">
              {([
                { label: "Padrão", key: "default" as keyof WaChannel },
                { label: "Digitando", key: "typing" as keyof WaChannel },
                { label: "Gravando", key: "recording" as keyof WaChannel },
              ]).map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <GlassToggle value={form[item.key] as boolean} onChange={v => set(item.key, v)} />
                  <span style={{ fontSize: 13, color: t.textSecondary }}>{item.label}</span>
                </div>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Mensagens" icon={MessageCircle}
            open={openAccordion === "msgs"}
            onToggle={() => setOpenAccordion(openAccordion === "msgs" ? null : "msgs")}
            t={t} isDark={isDark}>
            <div className="flex flex-col gap-3">
              {([
                { key: "msgInactivity" as keyof WaChannel, label: "Mensagem de recepção" },
                { key: "msgConclusion" as keyof WaChannel, label: "Mensagem de conclusão" },
              ]).map(f => (
                <div key={f.key}>
                  <FieldLabel t={t}>{f.label}</FieldLabel>
                  <StyledTextarea value={form[f.key] as string} onChange={v => set(f.key, v)} placeholder={f.label} t={t} />
                </div>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection title="Integrações" icon={Link}
            open={openAccordion === "integ"}
            onToggle={() => setOpenAccordion(openAccordion === "integ" ? null : "integ")}
            t={t} isDark={isDark}>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel t={t}>Fluxo para Primeiro Contato</FieldLabel>
                <div className="flex items-center px-4 py-2.5 rounded-xl" style={{ ...t.panelInput }}>
                  <select className="flex-1 bg-transparent outline-none appearance-none" style={{ fontSize: 13, color: t.textSecondary }}>
                    <option>Ura Padrão</option>
                    <option>Boas-vindas</option>
                    <option>Qualificação</option>
                  </select>
                  <ChevronDown size={14} style={{ color: t.textMuted, flexShrink: 0 }} />
                </div>
              </div>
              <div>
                <FieldLabel t={t}>Fluxo Chatbot Padrão</FieldLabel>
                <div className="flex items-center px-4 py-2.5 rounded-xl" style={{ ...t.panelInput }}>
                  <select className="flex-1 bg-transparent outline-none appearance-none" style={{ fontSize: 13, color: t.textSecondary }}>
                    <option>Ura Padrão</option>
                    <option>Chatbot Vendas</option>
                    <option>Chatbot Suporte</option>
                  </select>
                  <ChevronDown size={14} style={{ color: t.textMuted, flexShrink: 0 }} />
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb" }}>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb", fontSize: 13, fontWeight: 500, color: t.textSecondary }}>
            Cancelar
          </button>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ec4899, #7c3aed)", border: "none", fontSize: 13, fontWeight: 600, color: "white", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
            <Check size={14} /> Salvar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
