import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // optional validation
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Title and content are required!");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "unsigned_preset");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/daobnkozs/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (!data.secure_url) throw new Error("Failed to upload image");
        imageUrl = data.secure_url;
        console.log(" Image uploaded to Cloudinary:", imageUrl);
      }

      await addDoc(collection(db, "posts"), {
        title,
        content,
        imageUrl,
        authorId: auth.currentUser.uid,
        authorEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      console.log(" Post created!");
      navigate("/");
    } catch (err) {
      console.error(" Error creating post:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 text-white p-4">
      <div className="max-w-2xl mx-auto mt-8 bg-white/10 p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded text-black"
            required
          />

          <textarea
            placeholder="Post Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-2 rounded text-black"
            required
          ></textarea>

          <input
            type="file"
            onChange={handleImageChange}
            className="text-black"
            accept="image/*"
          />

          {imagePreview && (
            <div>
              <p className="text-sm mb-2">Image preview:</p>
              <img
                src={imagePreview}
                alt="preview"
                className="w-full max-h-64 object-cover rounded"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
