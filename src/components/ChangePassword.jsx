
import { useState } from "react";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import { auth } from "../firebase/config";

function ChangePassword({ user, notify }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      notify("Please fill all fields.", "error");
      return;
    }

    if (newPassword.length < 8) {
      notify("New password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify("New passwords do not match.", "error");
      return;
    }

    if (currentPassword === newPassword) {
      notify(
        "New password must be different from current password.",
        "error"
      );
      return;
    }

    if (!user || auth.currentUser?.uid !== user.uid) {
      notify("Please login again.", "error");
      return;
    }

    const hasPasswordProvider = user.providerData?.some(
      (provider) => provider.providerId === "password"
    );

    if (!hasPasswordProvider) {
      notify(
        "Password change is not available for Google-only accounts.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      notify("Password changed successfully!", "success");
    } catch (error) {
      console.error("Change Password Error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        notify("Current password is incorrect.", "error");
      } else if (error.code === "auth/weak-password") {
        notify("Please choose a stronger password.", "error");
      } else if (error.code === "auth/requires-recent-login") {
        notify(
          "Please login again and try changing your password.",
          "error"
        );
      } else {
        notify(
          error.message || "Unable to change password.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1426] p-6">
      <h3 className="mb-5 text-lg font-semibold text-white">
        Change Password
      </h3>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Current Password
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full rounded-xl border border-white/10 bg-[#080d1b] px-4 py-3 text-white outline-none focus:border-indigo-400"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full rounded-xl border border-white/10 bg-[#080d1b] px-4 py-3 text-white outline-none focus:border-indigo-400"
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-white/10 bg-[#080d1b] px-4 py-3 text-white outline-none focus:border-indigo-400"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
