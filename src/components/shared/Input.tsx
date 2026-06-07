interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wide?: boolean;
}

export function Input({ label, wide, className = "", ...props }: InputProps) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </span>
      <input
        className={`w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all ${className}`}
        {...props}
      />
    </label>
  );
}
