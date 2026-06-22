import Button from "@mui/material/Button";
import FormField from "./FormField";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { handlePieceSubmit, deletePiece } from "../../../utils/utils";

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

  const handleDelete = (e) => {
    e.preventDefault();
    if (!window.confirm(`Delete "${data.title}"? This will also remove the audio and score files from S3.`))
      return;
    toast.promise(deletePiece(data._id), {
      pending: "Deleting...",
      success: {
        render({ data }) {
          setTimeout(() => navigate(0), 1000);
          return data.success;
        },
      },
      error: {
        render({ data }) {
          return data?.response?.data?.error || "Error deleting piece";
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
      {!isNewPiece && (
        <div className="input-row">
          <label>Status:</label>
          <select
            name="status"
            onChange={handleInputChange}
            className="input-box input-contributor"
            value={data.status || "active"}
          >
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="deleted">deleted</option>
          </select>
        </div>
      )}
      <div className="contributor-button-row">
        <Button
          className={audioFile ? "Button file-selected" : ""}
          style={{ marginBottom: "1em", width: "25%" }}
          component="label"
        >
          Select audio
          <input hidden onChange={handleAudioChange} accept="audio/mp3" type="file" />
        </Button>
        <Button
          className={scoreFile ? "Button file-selected" : ""}
          style={{ marginBottom: "1em", width: "25%" }}
          component="label"
        >
          Select score
          <input hidden onChange={handleScoreChange} accept="application/pdf" type="file" />
        </Button>
        <Button
          type="submit"
          style={{ marginBottom: "1em", width: "25%" }}
          variant="contained"
        >
          {isNewPiece ? "Create" : "Update"}
        </Button>
        {!isNewPiece && (
          <Button
            style={{ marginBottom: "1em", width: "20%", color: "#d32f2f", borderColor: "#d32f2f" }}
            onClick={handleDelete}
            variant="outlined"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
