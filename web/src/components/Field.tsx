type FieldProps = {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export default function Field({
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  onChange,
}: FieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
