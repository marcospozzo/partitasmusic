import "./App.css";
import Header from "./components/Home/Header/Header";
import Contributors from "./components/Home/Body/Contributors";
import Contributor from "./components/Home/Body/Contributor";
import Users from "./components/Home/Users";
import ContributorEdit from "./components/Home/Body/ContributorEdit";
import { Routes, Route, Navigate } from "react-router-dom";
import Protected from "./components/Protected";
import Login from "./components/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Header />
              <Contributors />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/new-contributor"
          element={
            <Protected>
              <Header />
              <Contributor />
            </Protected>
          }
        />
        <Route
          path="/contributors/:path"
          element={
            <Protected>
              <Header />
              <ContributorEdit />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/users"
          element={
            <Protected>
              <Header />
              <Users />
            </Protected>
          }
        />
      </Routes>
    </>
  );
}

export default App;
