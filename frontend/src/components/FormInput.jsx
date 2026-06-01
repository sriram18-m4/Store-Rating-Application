export default function FormInput({ label, error, as = 'input', ...props }) {
  const Component = as;

  return (
    <label className="form-field">
      <span>{label}</span>
      <Component className={error ? 'has-error' : ''} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
