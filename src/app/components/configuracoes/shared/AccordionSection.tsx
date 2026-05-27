import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  open: boolean;
  onToggle: () => void;
  t: any;
  isDark: boolean;
}

export function AccordionSection({ title, children, icon: Icon, open, onToggle, t, isDark }: AccordionSectionProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{
      border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e5e7eb",
      background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
    }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-3.5 transition-all hover:opacity-80">
        <div className="flex items-center gap-2.5">
          <Icon size={15} style={{ color: "#7c3aed" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{title}</span>
        </div>
        {open ? <ChevronUp size={15} style={{ color: t.textMuted }} /> : <ChevronDown size={15} style={{ color: t.textMuted }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
            <div className="px-5 pb-5 flex flex-col gap-3"
              style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e7eb" }}>
              <div className="mt-3">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
