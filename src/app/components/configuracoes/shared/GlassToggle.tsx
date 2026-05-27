import { GlassToggleProps } from './types';

export function GlassToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="relative flex items-center flex-shrink-0"
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? "linear-gradient(135deg, #ec4899, #7c3aed)" : "rgba(124,58,237,0.12)",
        border: value ? "none" : "1px solid rgba(124,58,237,0.2)",
        boxShadow: value ? "0 4px 12px rgba(124,58,237,0.35)" : "none",
        transition: "all 0.25s ease",
      }}>
      <div style={{
        position: "absolute", width: 18, height: 18, borderRadius: "50%",
        background: value ? "white" : "#c4b5fd",
        left: value ? 22 : 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        transition: "left 0.25s ease, background 0.2s ease",
      }} />
    </button>
  );
}
