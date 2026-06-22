import axios from "axios";

export function convertToSlug(string) {
  const withoutAccents = string
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  return withoutAccents
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export const axiosInstance = axios.create({ baseURL: `/api` });

axiosInstance.interceptors.request.use((config) => {
  // read token on every request so it's always current after login
  config.headers["x-access-token"] =
    JSON.parse(localStorage.getItem("jwt")) || "";
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export const handlePieceSubmit = (
  e,
  data,
  isNewPiece,
  audioFile,
  scoreFile,
  path
) => {
  e.preventDefault();

  const formData = new FormData();
  !isNewPiece && formData.append("id", data._id);
  formData.append("title", data.title);
  formData.append("description", data.description);
  data.status && formData.append("status", data.status);
  audioFile && formData.append("audio", audioFile);
  scoreFile && formData.append("score", scoreFile);

  const endpoint = isNewPiece ? `/create-piece/${path}` : "/update-piece";

  return axiosInstance
    .post(endpoint, formData)
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export const handleContributorSubmit = (
  e,
  data,
  newPicture,
  path,
  isNewContributor
) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("sortBy", data.sortBy);
  formData.append("country", data.country);
  formData.append("contact", data.contact || "");
  formData.append("donate", data.donate || "");
  formData.append("category", data.category);
  formData.append("bio", data.bio || "");
  formData.append("path", path);
  formData.append("type", data.type);
  data.status && formData.append("status", data.status);
  newPicture && formData.append("image", newPicture);

  const endpoint = isNewContributor
    ? "/create-contributor"
    : "/update-contributor";

  return axiosInstance
    .post(endpoint, formData)
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

export async function login(username, password) {
  try {
    const response = await axiosInstance.post("/signin", { username, password });
    if (response.data.accessToken) {
      localStorage.setItem("jwt", JSON.stringify(response.data.accessToken));
    }
  } catch (error) {
    throw error;
  }
}

export const deletePiece = (id) =>
  axiosInstance.delete(`/piece/${id}`).then((r) => r.data);
