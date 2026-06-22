import { useNavigate } from "react-router-dom";
import Piece from "./Piece";
import { useState, useEffect } from "react";
import { axiosInstance } from "../../../utils/utils";

export default function Pieces({ path }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

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
      <h3 className="pieces-title">Pieces</h3>
      {data.map((piece) => (
        <Piece key={piece._id} piece={piece} />
      ))}
      <Piece path={path} />
    </div>
  );
}
