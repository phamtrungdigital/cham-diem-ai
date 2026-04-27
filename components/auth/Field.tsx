type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
};

export default function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
  defaultValue,
  hint,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className="block h-11 w-full rounded-[12px] border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      {hint && (
        <span className="mt-1.5 block text-xs text-[var(--color-text-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}
