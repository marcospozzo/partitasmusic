import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  axiosInstance,
  handleContributorSubmit,
  convertToSlug,
} from "../../../utils/utils.js";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import EditableTitle from "./EditableTitle";

export default function Contributor({ path = "" }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [newPicture, setNewPicture] = useState(null);
  const isNewContributor = path === "";

  const handleDownload = async (event) => {
    event.preventDefault();
    try {
      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(
            `/api/generate-contributors-image/${path}`
          );

          const blob = await response.blob();

          // Create a link element
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = `${path}.png`;

          // Append the link to the body
          document.body.appendChild(link);

          // Trigger the click event on the link
          link.click();

          // Remove the link from the DOM
          document.body.removeChild(link);

          resolve(); // Resolve the promise on success
        } catch (error) {
          reject(error); // Reject the promise on error
        }
      });

      toast.promise(promise, {
        pending: "Downloading...",
        success: "Image downloaded successfully",
        error: "Error downloading image",
      });
    } catch (error) {
      toast.error("Error downloading image");
      console.error("Error downloading image:", error);
    }
  };

  function handleImageChange(e) {
    const newPicture = e.target.files[0];
    if (newPicture) {
      // display the selected image instead of the previous one
      const objectUrl = URL.createObjectURL(newPicture);
      document.getElementById("profile-picture").src = objectUrl;

      setNewPicture(newPicture);
    }
  }

  function handleOnCancel(e) {
    e.preventDefault();
    isNewContributor ? navigate("/") : navigate(0);
  }

  function handleInputChange(e) {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    const path =
      isNewContributor && data.name ? convertToSlug(data.name) : data.path;
    const promise = handleContributorSubmit(
      e,
      data,
      newPicture,
      path,
      isNewContributor
    );

    toast.promise(promise, {
      pending: "Loading...",
      success: {
        render({ data }) {
          isNewContributor &&
            setTimeout(() => {
              navigate(`/contributors/${path}`);
            }, 1000);
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

  useEffect(() => {
    !isNewContributor && // if is not a new contributor, fetch data
      axiosInstance
        .get(`/get-contributor/${path}`)
        .then((response) => {
          response.data.sortBy = response.data.sort; // this fixes error that makes compiler think sort is a function and can't be rendered
          setData(response.data);
        })
        .catch((error) => {
          console.error(error);
          navigate("/");
        });
  }, [isNewContributor, navigate, path]);

  return (
    <div
      className={
        isNewContributor
          ? "contributor-edit new-contributor-edit"
          : "contributor-edit"
      }
    >
      <form className="contributor-form" onSubmit={handleSubmit}>
        {!isNewContributor && (
          <>
            <a
              href={`/music-catalog/${path}`}
              className="links unselected"
              target="_blank"
              rel="noreferrer"
            >
              Open in Partitas Music
            </a>
            <button className="links unselected" onClick={handleDownload}>
              Download profile image
            </button>
          </>
        )}
        <img
          id="profile-picture"
          className="profile-picture"
          alt={data.name}
          src={
            isNewContributor
              ? `${process.env.PUBLIC_URL}/Profile_avatar_placeholder_large.png`
              : data.picture
          }
        ></img>
        <Button
          style={{ width: "40%", alignSelf: "center", marginBottom: "1em" }}
          variant="contained"
          component="label"
        >
          Select picture
          <input
            name="picture"
            onChange={handleImageChange}
            hidden
            accept="image/*"
            type="file"
          />
        </Button>
        <EditableTitle
          handleOnChange={handleInputChange}
          label="Name"
          fieldName="name"
          text={data.name}
        />
        <EditableTitle
          handleOnChange={handleInputChange}
          label="Sort by"
          fieldName="sortBy"
          text={data.sortBy}
        />
        <EditableTitle
          handleOnChange={handleInputChange}
          label="Country"
          fieldName="country"
          text={data.country}
        />
        <EditableTitle
          handleOnChange={handleInputChange}
          label="Contact"
          fieldName="contact"
          text={data.contact}
        />
        <EditableTitle
          handleOnChange={handleInputChange}
          label="Donate"
          fieldName="donate"
          text={data.donate}
        />
        <div className="input-row">
          <label>Category:</label>
          <select
            name="category"
            onChange={handleInputChange}
            className="input-box input-contributor"
            value={data.category}
            defaultValue=""
          >
            <option hidden disabled value=""></option>
            <option value="group">group</option>
            <option value="individual">individual</option>
          </select>
        </div>
        <div className="input-row">
          <label>Type:</label>
          <select
            name="type"
            onChange={handleInputChange}
            className="input-box input-contributor"
            value={data.type}
            defaultValue=""
          >
            <option hidden disabled value=""></option>
            <option value="not-featured">not-featured</option>
            <option value="featured">featured</option>
          </select>
        </div>
        <div className="input-row">
          <label>Bio:</label>
          <textarea
            name="bio"
            onChange={handleInputChange}
            className="input-box input-contributor"
            defaultValue={data.bio}
          ></textarea>
        </div>
        <div className="contributor-button-row">
          <Button
            style={{ width: "60%" }}
            className="submit-button"
            type="submit"
            variant="contained"
          >
            {isNewContributor ? "Create contributor" : "Update changes"}
          </Button>
          <Button
            style={{ width: "30%" }}
            onClick={handleOnCancel}
            variant="outlined"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
