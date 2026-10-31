
import { useState } from "react";

import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
} from "firebase/auth";

import { doc, deleteDoc } from "firebase/firestore";

import { auth, db } from "../firebase/config";

function DeleteAccount({ user, notify }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const hasPasswordProvider = user.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleDeleteAccount = async () => {
    if (confirmation !== "DELETE") {
      notify('Please type DELETE to confirm.', "error");
      return;
    }

    if (hasPasswordProvider && !password.trim()) {
      notify("Please enter your current password.", "error");
      return;
    }

    if (!user || auth.currentUser?.uid !== user.uid) {
      notify("Please login again.", "error");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Reauthenticate user
      if (hasPasswordProvider) {
        const credential = EmailAuthProvider.credential(
          user.email,
          password
        );

        await reauthenticateWithCredential(user, credential);
      } else {
        const provider = new GoogleAuthProvider();

        await reauthenticateWithPopup(user, provider);
      }

      // Step 2: Delete Firestore profile
      await deleteDoc(doc(db, "users", user.uid));

      // Step 3: Delete Firebase Authentication account
      await deleteUser(user);

      // Global success notification
      notify("Account deleted successfully.", "success");
    } catch (error) {
      console.error("Delete Account Error:", error);

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        notify(
          "Incorrect password. Please try again.",
          "error"
        );
      } else if (error.code === "auth/requires-recent-login") {
        notify(
          "Please login again and retry account deletion.",
          "error"
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        notify(
          "Google verification was cancelled.",
          "error"
        );
      } else if (
        error.code === "permission-denied" ||
        error.code === "firestore/permission-denied"
      ) {
        notify(
          "Permission denied. Please check Firestore rules.",
          "error"
        );
      } else {
        notify(
          "Account deletion failed. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-6">
      <h2 className="text-xl font-bold text-red-400">
        Danger Zone
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Permanently delete your account and your Firestore profile.
        This action cannot be undone.
      </p>

      {!showConfirmation ? (
        <button
          type="button"
          onClick={() => {
            setShowConfirmation(true);
          }}
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
        >
          Delete My Account
        </button>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-sm font-medium text-white">
            Are you sure? This action is permanent.
          </p>

          {hasPasswordProvider && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Enter your current password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-[#0d1426] px-4 py-3 text-white outline-none focus:border-red-400"
              />
            </div>
          )}

          {!hasPasswordProvider && (
            <p className="text-sm text-slate-400">
              You will verify your identity using your Google account.
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Type DELETE to confirm
            </label>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-white/10 bg-[#0d1426] px-4 py-3 text-white outline-none focus:border-red-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading || confirmation !== "DELETE"}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowConfirmation(false);
                setPassword("");
                setConfirmation("");
              }}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteAccount;
