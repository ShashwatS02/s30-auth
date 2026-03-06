import { useState } from "react";
import { login } from "../api/client";
import AuthCard from "../components/AuthCard";
import Field from "../components/Field";
import StatusBanner from "../components/StatusBanner";

type LoginPageProps = {
  onLoginSuccess: (accessToken: string) => void;
  onSwitchToRegister: () => void;
};

export default function LoginPage({
  onLoginSuccess,
  onSwitchToRegister,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "error">("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await login({
        email: normalizedEmail,
        password,
      });

      setTone("success");
      setStatus("Login successful. Redirecting to your session...");
      onLoginSuccess(res.accessToken);
    } catch (err) {
      setTone("error");
      setStatus(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthCard
        title="Welcome back"
        subtitle="Log in to inspect your current session and token flow."
        footer={
          <div className="helper-row">
            <span className="helper-text">New here?</span>
            <button
              type="button"
              className="secondary"
              onClick={onSwitchToRegister}
            >
              Create account
            </button>
          </div>
        }
      >
        <StatusBanner tone={tone} message={status} />

        <form className="form-stack" onSubmit={handleSubmit}>
          <Field
            label="Email"
            type="email"
            value={email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={setEmail}
          />

          <Field
            label="Password"
            type="password"
            value={password}
            placeholder="Enter your password"
            autoComplete="current-password"
            onChange={setPassword}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
