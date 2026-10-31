
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

function Signup({ notify }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter (A-Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a-z)",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number (0-9)",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character (!@#$)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const isPasswordStrong = passwordRules.every(
    (rule) => rule.valid
  );

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const getErrorMessage = (error) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please login.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Please choose a stronger password.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/operation-not-allowed":
        return "Email and password signup is not enabled.";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  // Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      notify("Please enter your full name.", "error");
      return;
    }

    if (!isPasswordStrong) {
      notify(
        "Please fulfill all password requirements.",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      notify("Passwords do not match!", "error");
      return;
    }

    setLoading(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // Save user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: user.email,
        createdAt: serverTimestamp(),
        photoURL: null,
      });

      // Send verification email without blocking login
      let verificationSent = true;

      try {
        await sendEmailVerification(user);
      } catch (verificationError) {
        console.error(
          "Email Verification Error:",
          verificationError
        );

        verificationSent = false;
      }

      notify(
        verificationSent
          ? "Account created successfully! Profile saved and verification email sent."
          : "Account created successfully! Profile saved, but verification email could not be sent.",
        "success"
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Signup Error:", error);
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
        Create Account
      </h2>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            className={inputClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

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
              placeholder="Create a strong password"
              className={`${inputClasses} pr-20`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-slate-400">
              Password requirements:
            </p>

            {passwordRules.map((rule) => (
              <p
                key={rule.label}
                className={`text-xs ${
                  rule.valid
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {rule.valid ? "✓" : "○"} {rule.label}
              </p>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Confirm Password
          </label>

          <div className="relative">
            <input
              type={
                showConfirmPassword ? "text" : "password"
              }
              placeholder="Enter password again"
              className={`${inputClasses} pr-20`}
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {confirmPassword.length > 0 && (
            <p
              className={`mt-2 text-xs ${
                passwordsMatch
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {passwordsMatch
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
