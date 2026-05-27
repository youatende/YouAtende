export function FieldLabel({ children, t }: { children: React.ReactNode; t: any }) {
  return <label className="block mb-1.5" style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>{children}</label>;
}
