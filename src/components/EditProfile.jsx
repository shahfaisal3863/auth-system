
import { useState, useEffect } from "react";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

function EditProfile({ profile, user, notify }) {
  const [name, setName] = useState(profile?.name || "");
  const [photoURL, setPhotoURL] = useState(
    profile?.photoURL || user?.photoURL || ""
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(profile?.name || "");
    setPhotoURL(profile?.photoURL || user?.photoURL || "");
  }, [profile, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedName = name.trim();
    const updatedPhotoURL = photoURL.trim();

    if (!updatedName) {
      notify("Name cannot be empty.", "error");
      return;
    }

    if (!user || auth.currentUser?.uid !== user.uid) {
      notify("Please login again.", "error");
      return;
    }

    if (updatedPhotoURL) {
      try {
        const url = new URL(updatedPhotoURL);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        notify("Please enter a valid image URL.", "error");
        return;
      }
    }

    setLoading(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: updatedName,
          email: user.email,
          photoURL: updatedPhotoURL || null,
          createdAt: profile?.createdAt || serverTimestamp(),
        },
        { merge: true }
      );

      notify("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Profile Update Error:", error);

      notify(
        error.message || "Unable to update profile.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1426] p-6">
      <h3 className="mb-5 text-lg font-semibold text-white">
        Edit Profile
      </h3>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Full Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-white/10 bg-[#080d1b] px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Profile Picture URL
          </label>

          <input
            type="url"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="Paste your image URL here"
            className="w-full rounded-xl border border-white/10 bg-[#080d1b] px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />

          <p className="mt-2 text-xs text-slate-400">
            Enter a publicly accessible image URL.
          </p>
        </div>

        {photoURL && (
          <div>
            <p className="mb-2 text-sm text-slate-300">
              Image Preview
            </p>

            <img
              src={photoURL}
              alt="Profile preview"
              className="h-20 w-20 rounded-full border border-white/20 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
