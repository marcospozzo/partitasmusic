import { useNavigate } from "react-router-dom";
import Piece from "./Piece";
import { useState, useEffect } from "react";
import { axiosInstance } from "../../../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function Pieces({ path }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showNewPiece, setShowNewPiece] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/get-pieces/${path}`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
        navigate("/");
      });
  }, [navigate, path]);

  return (
    <div className="pieces">
      <div className="pieces-header">
        <h3 className="pieces-title">Pieces</h3>
        <button
          className="plus-button unselected"
          title="Add piece"
          onClick={() => setShowNewPiece((v) => !v)}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      {data.map((piece) => (
        <Piece key={piece._id} piece={piece} />
      ))}
      {showNewPiece && <Piece path={path} />}
    </div>
  );
}
