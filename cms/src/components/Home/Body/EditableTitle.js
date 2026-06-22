import { useState } from "react";

export default function EditableTitle({
  text = "",
  label,
  fieldName,
  handleOnChange,
}) {
  const [isEditing, setIsEditing] = useState(false);

  function handleOnClick(e) {
    setIsEditing(!isEditing);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleOnClick();
    }
  }

  function handleOnChangeEdit(e) {
    setIsEditing(true);
    handleOnChange(e);
  }

  return (
    <div className="editable-row">
      <label>{`${label}:`}</label>
      {isEditing || text === "" ? (
        <input
          name={fieldName}
          onChange={handleOnChangeEdit}
          defaultValue={text}
          onBlur={handleOnClick}
          onKeyDown={handleKeyDown}
          className="input-box input-contributor"
          type="text"
          autoFocus={text !== ""}
        />
      ) : (
        <button onClick={handleOnClick} className="editable-title">
          {text}
        </button>
      )}
    </div>
  );
}
