import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUsers();
        await fetchPosts();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = {};
    querySnapshot.forEach((doc) => {
      usersData[doc.id] = doc.data();
    });
    setUsersMap(usersData);
  };

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postsData);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    fetchPosts();
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSave = async (id) => {
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      title: editTitle,
      content: editContent,
    });
    setEditingPostId(null);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
  Welcome, {usersMap[user?.uid]?.firstName} {usersMap[user?.uid]?.lastName || ""}!
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <Link
            to="/create"
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
          >
            + Create New Post
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mb-4"> Posts</h2>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-300">No posts yet. Start by creating one!</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white/10 p-4 rounded shadow flex flex-col gap-2"
              >
                {editingPostId === post.id ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-black p-1 mb-2 w-full"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="text-black p-1 w-full"
                    ></textarea>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p>{post.content}</p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="post"
                        className="mt-2 rounded max-h-64"
                      />
                    )}
                    <p className="text-sm text-gray-300 mt-1">
                      by {usersMap[post.authorId]?.firstName} {usersMap[post.authorId]?.lastName}
                    </p>
                  </div>
                )}

                {post.authorId === user?.uid && (
                  <div className="space-x-2">
                    {editingPostId === post.id ? (
                      <button
                        onClick={() => handleSave(post.id)}
                        className="px-3 py-1 bg-green-500 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
