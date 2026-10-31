
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase/config";

function Login({ notify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error) => {
    switch (error.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Incorrect email or password.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/popup-closed-by-user":
        return "Google login was cancelled.";

      case "auth/popup-blocked":
        return "Popup was blocked. Please allow popups in your browser.";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  // Email Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      notify("Please enter email and password.", "error");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      notify(
        `Login successful! Welcome ${result.user.email}`,
        "success"
      );
    } catch (error) {
      console.error("Login Error:", error);
      notify(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      notify(
        `Google Login Successful! Welcome ${result.user.email}`,
        "success"
      );
    } catch (error) {
      console.error("Google Login Error:", error);
      notify(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      notify("Please enter your email address first.", "error");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      notify(
        "Password reset link sent! Please check your email.",
        "success"
      );
    } catch (error) {
      console.error("Password Reset Error:", error);
      notify(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-[#0d1426] px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20";

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">
        Sign In to Your Account
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Email address
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            className={inputClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`${inputClasses} pr-20`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-500">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
          G
        </span>

        Continue with Google
      </button>
    </div>
  );
}

export default Login;
