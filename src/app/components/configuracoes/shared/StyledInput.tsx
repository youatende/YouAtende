interface StyledInputProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  t: any;
  suffix?: React.ReactNode;
}

export function StyledInput({ value, onChange, placeholder, t, suffix }: StyledInputProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ ...t.panelInput }}>
      <input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent outline-none" style={{ fontSize: 13, color: t.textPrimary }} />
      {suffix}
    </div>
  );
}
