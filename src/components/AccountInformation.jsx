
function AccountInformation({ user, profile }) {
  const loginProviders = user.providerData
    .map((provider) => {
      if (provider.providerId === "google.com") {
        return "Google";
      }

      if (provider.providerId === "password") {
        return "Email & Password";
      }

      return provider.providerId;
    })
    .join(", ");

  const accountCreated = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString()
    : "Not available";

  const emailVerified = user.emailVerified;

  const information = [
    {
      label: "Full Name",
      value: profile?.name || user.displayName || "Not available",
    },
    {
      label: "Email Address",
      value: user.email || "Not available",
    },
    {
      label: "Firebase User ID (UID)",
      value: user.uid,
    },
    {
      label: "Account Created",
      value: accountCreated,
    },
    {
      label: "Email Verification",
      value: emailVerified ? "Verified" : "Not Verified",
      status: true,
    },
    {
      label: "Login Provider",
      value: loginProviders || "Not available",
    },
  ];

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Account Details
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Account Information
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          View your personal and authentication details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {information.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-[#0d1426] p-5"
          >
            <p className="text-sm text-slate-400">
              {item.label}
            </p>

            <p
              className={`mt-2 break-all text-sm font-semibold ${
                item.status
                  ? emailVerified
                    ? "text-emerald-400"
                    : "text-amber-400"
                  : "text-white"
              }`}
            >
              {item.status && (emailVerified ? "✓ " : "○ ")}
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AccountInformation;
