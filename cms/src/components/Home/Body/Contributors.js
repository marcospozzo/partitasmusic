import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/utils";

export default function Contributors() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/get-contributors")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Error fetching API. Try again...", {
          toastId: "error1",
        });
      });
  }, []);

  return (
    <div>
      <div className="search-bar">
        <SearchBox filterText={filterText} onFilterTextChange={setFilterText} />
        <PlusButton />
      </div>
      <ContributorsList data={data} filterText={filterText} />
    </div>
  );
}

function SearchBox({ filterText, onFilterTextChange }) {
  return (
    <div className="input-box">
      <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />
      <input
        autoFocus
        value={filterText}
        placeholder="Search"
        onChange={(e) => onFilterTextChange(e.target.value)}
      />
    </div>
  );
}

function PlusButton() {
  return (
    <Link to={`/new-contributor`} className="input-box plus-button">
      <FontAwesomeIcon
        style={{ marginRight: "0" }}
        className="icon"
        icon={faPlus}
      />
    </Link>
  );
}

function ContributorsList({ data, filterText }) {
  const list = [];

  data.forEach((contributor) => {
    if (
      contributor.name.toLowerCase().indexOf(filterText.toLowerCase()) === -1
    ) {
      return;
    } else {
      list.push(
        <ContributorCard
          key={contributor._id}
          name={contributor.name}
          path={contributor.path}
        />
      );
    }
  });

  return <div className="contributors-list">{list}</div>;
}

function ContributorCard({ name, path }) {
  return (
    <Link to={`/contributors/${path}`} className="contributor-card">
      {name}
    </Link>
  );
}
