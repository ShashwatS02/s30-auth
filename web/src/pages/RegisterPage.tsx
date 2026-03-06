import { useState } from "react";
import { register } from "../api/client";
import AuthCard from "../components/AuthCard";
import Field from "../components/Field";
import StatusBanner from "../components/StatusBanner";

type RegisterPageProps = {
  onSwitchToLogin: () => void;
};

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
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
      const res = await register({
        email: normalizedEmail,
        password,
      });

      setTone("success");
      setStatus(`Account created for ${res.user.email}. You can log in now.`);
      setEmail("");
      setPassword("");
    } catch (err) {
      setTone("error");
      setStatus(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthCard
        title="Create your account"
        subtitle="Set up a secure account to test the full auth flow."
        footer={
          <div className="helper-row">
            <span className="helper-text">Already have an account?</span>
            <button
              type="button"
              className="secondary"
              onClick={onSwitchToLogin}
            >
              Go to login
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
            placeholder="Use a strong password"
            autoComplete="new-password"
            onChange={setPassword}
          />

          <p className="helper-text">
            Password must be at least 10 characters and include a number and a special character.
          </p>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
