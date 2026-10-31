
import {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import Toast from "./components/Toast";
import { auth, db } from "./firebase/config";

// Lazy Loaded Components
const Signup = lazy(() => import("./components/Signup"));
const Login = lazy(() => import("./components/Login"));
const EditProfile = lazy(() => import("./components/EditProfile"));
const ChangePassword = lazy(() => import("./components/ChangePassword"));
const AccountInformation = lazy(
  () => import("./components/AccountInformation")
);
const DeleteAccount = lazy(() => import("./components/DeleteAccount"));

// Loading Screen
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d1b] text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-400/20 border-t-indigo-400" />
    </div>
  );
}

// Protected Route
function ProtectedRoute({ user, loading, children }) {
  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route
function PublicRoute({ user, loading, children }) {
  if (loading) return <LoadingScreen />;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Login / Signup Page
function AuthPage({ type, notify }) {
  const isLogin = type === "login";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d1b] px-4 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-2xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold">
            A
          </div>

          <h1 className="text-3xl font-bold">
            Auth<span className="text-indigo-400">System</span>
          </h1>
        </div>

        {isLogin ? (
          <Login notify={notify} />
        ) : (
          <Signup notify={notify} />
        )}

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <p className="text-slate-400">
              New here?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Create an account
              </Link>
            </p>
          ) : (
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard({ user, profile, handleLogout, notify }) {
  const displayName =
    profile?.name || user.displayName || "User Account";

  return (
    <div className="min-h-screen bg-[#080d1b] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-5 sm:px-10">
        <h1 className="text-xl font-bold">
          Auth<span className="text-indigo-400">System</span>
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-500/10 hover:text-red-300"
        >
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Your Workspace
        </p>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Welcome back<span className="text-indigo-400">.</span>
        </h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {profile?.photoURL || user.photoURL ? (
              <img
                src={profile?.photoURL || user.photoURL}
                alt="Profile"
                className="h-24 w-24 rounded-2xl border-2 border-indigo-400/30 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold">
                {(displayName[0] || "U").toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">
                {displayName}
              </h2>

              <p className="mt-2 break-all text-slate-400">
                {profile?.email || user.email}
              </p>

              <p className="mt-3 text-sm text-emerald-400">
                ● Authenticated
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0d1426] p-5">
              <p className="text-sm text-slate-400">
                Account Status
              </p>

              <p className="mt-2 text-lg font-semibold text-emerald-400">
                Active
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1426] p-5">
              <p className="text-sm text-slate-400">
                Sign-in Method
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {user.providerData?.some(
                  (provider) => provider.providerId === "google.com"
                )
                  ? "Google"
                  : "Email & Password"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d1426] p-5">
            <p className="text-sm text-slate-400">
              Account Created
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {profile?.createdAt?.toDate
                ? profile.createdAt.toDate().toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>

        <EditProfile profile={profile} user={user} notify={notify} />

        <ChangePassword user={user} notify={notify} />

        <AccountInformation user={user} profile={profile} />

        <DeleteAccount user={user} notify={notify} />

        <p className="mt-6 text-center text-sm text-slate-500">
          Secure authentication powered by Firebase
        </p>
      </main>
    </div>
  );
}

// Main App
function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setProfile(null);
      setLoading(false);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        unsubscribeProfile = onSnapshot(
          doc(db, "users", currentUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data());
            } else {
              setProfile(null);
            }
          },
          (error) => {
            console.error("Profile Error:", error.message);
          }
        );
      }
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error.message);
      notify("Logout failed. Please try again.", "error");
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <LoadingScreen />
              ) : (
                <Navigate
                  to={user ? "/dashboard" : "/login"}
                  replace
                />
              )
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute user={user} loading={loading}>
                <AuthPage type="login" notify={notify} />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute user={user} loading={loading}>
                <AuthPage type="signup" notify={notify} />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Dashboard
                  user={user}
                  profile={profile}
                  handleLogout={handleLogout}
                  notify={notify}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
