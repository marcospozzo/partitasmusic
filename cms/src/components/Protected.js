import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Protected = ({ children }) => {
  const [tokenIsValid, setTokenIsValid] = useState(null);

  useEffect(() => {
    (async function () {
      try {
        const response = await axios.get(
          `/api/verifyToken`,
          {
            headers: {
              "x-access-token": JSON.parse(localStorage.getItem("jwt")),
            },
          }
        );
        setTokenIsValid(response.status === 200);
      } catch (error) {
        setTokenIsValid(false);
      }
    })();
  }, []);

  return tokenIsValid === null ? (
    <div></div>
  ) : tokenIsValid ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

export default Protected;
