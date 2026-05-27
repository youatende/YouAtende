interface StyledTextareaProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  t: any;
}

export function StyledTextarea({ value, onChange, placeholder, t }: StyledTextareaProps) {
  return (
    <textarea value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} rows={3}
      className="w-full px-4 py-3 rounded-xl outline-none resize-none"
      style={{ ...t.panelInput, fontSize: 13, color: t.textPrimary }} />
  );
}
