export default function FormField({ label, fieldName, value = "", onChange }) {
  return (
    <div className="input-row">
      <label>{label}:</label>
      <input
        name={fieldName}
        value={value}
        onChange={onChange}
        className="input-box input-contributor"
        type="text"
      />
    </div>
  );
}
