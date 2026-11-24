import { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/utils";

function fileNameFromHeader(header, fallback) {
  if (!header) return fallback;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) return decodeURIComponent(utf8[1]);
  const plain = /filename="([^"]+)"/i.exec(header);
  return plain ? plain[1] : fallback;
}

async function errorMessage(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).error;
    } catch {
      /* fall through */
    }
  }
  return "Could not generate the PDF";
}

export default function BookPdf() {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) return;

    setLoading(true);
    const promise = axiosInstance
      .post("/watermark-book", { fullName: name }, { responseType: "blob" })
      .then((response) => {
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileNameFromHeader(
          response.headers["content-disposition"],
          `book - ${name}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      })
      .catch(async (error) => {
        throw new Error(await errorMessage(error));
      })
      .finally(() => setLoading(false));

    toast.promise(promise, {
      pending: "Generating PDF...",
      success: "PDF downloaded",
      error: { render: ({ data }) => data.message },
    });
  }

  return (
    <div className="book-pdf">
      <form className="contributor-form" onSubmit={handleSubmit}>
        <p className="book-pdf-hint">
          Adds “For the exclusive personal use of &lt;Full Name&gt;” to pages
          6–42 of the book.
        </p>
        <div className="input-row">
          <label htmlFor="fullName">Full name:</label>
          <input
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-box input-contributor"
            type="text"
            maxLength={100}
            autoComplete="off"
          />
        </div>
        <div className="contributor-button-row">
          <button
            type="submit"
            className="submit-button"
            disabled={loading || !fullName.trim()}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
