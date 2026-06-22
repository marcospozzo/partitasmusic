import Button from "@mui/material/Button";
import FormField from "./FormField";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { handlePieceSubmit } from "../../../utils/utils";

export default function Piece({
  piece = { title: "", description: "" },
  path,
}) {
  const [data, setData] = useState(piece);
  const [audioFile, setAudioFile] = useState(null);
  const [scoreFile, setScoreFile] = useState(null);
  const isNewPiece = piece.title === "" && piece.description === "";
  const navigate = useNavigate();

  function handleAudioChange(e) {
    setAudioFile(e.target.files[0]);
  }

  function handleScoreChange(e) {
    setScoreFile(e.target.files[0]);
  }

  function handleInputChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    const promise = handlePieceSubmit(
      e,
      data,
      isNewPiece,
      audioFile,
      scoreFile,
      path
    );
    toast.promise(promise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          isNewPiece && setTimeout(() => navigate(0), 1000);
          return data.success;
        },
      },
      error: {
        render({ data }) {
          return data.response.data.error;
        },
      },
    });
  };

  return (
    <form className="piece" onSubmit={handleSubmit}>
      <FormField
        label="Title"
        fieldName="title"
        value={data.title}
        onChange={handleInputChange}
      />
      <div className="input-row">
        <label>Description:</label>
        <textarea
          name="description"
          onChange={handleInputChange}
          className="input-box input-contributor"
          value={data.description}
        />
      </div>
      <div className="contributor-button-row">
        <Button
          className={audioFile ? "Button file-selected" : ""}
          style={{ marginBottom: "1em", width: "30%" }}
          component="label"
        >
          Select audio file
          <input hidden onChange={handleAudioChange} accept="audio/mp3" type="file" />
        </Button>
        <Button
          className={scoreFile ? "Button file-selected" : ""}
          style={{ marginBottom: "1em", width: "30%" }}
          component="label"
        >
          Select score file
          <input hidden onChange={handleScoreChange} accept="application/pdf" type="file" />
        </Button>
        <Button
          type="submit"
          style={{ marginBottom: "1em", width: "30%" }}
          variant="contained"
        >
          {isNewPiece ? "Create piece" : "Update piece"}
        </Button>
      </div>
    </form>
  );
}
