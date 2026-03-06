import { useEffect, useRef, useState } from "react";
import { refreshSession } from "./api/client";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

type View = "login" | "register" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("login");
  const [accessToken, setAccessToken] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    async function restoreSession() {
      try {
        const res = await refreshSession();
        setAccessToken(res.accessToken);
        setView("dashboard");
      } catch {
        setAccessToken("");
        setView("login");
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, []);

  if (isInitializing) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <p className="auth-card__eyebrow">s30-auth</p>
            <h1 className="auth-card__title">Restoring session</h1>
            <p className="auth-card__subtitle">
              Checking whether a refresh cookie can restore your login.
            </p>
          </div>

          <div className="auth-card__body">
            <div className="status-banner status-banner--neutral">
              Please wait a moment...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "register") {
    return <RegisterPage onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "login") {
    return (
      <LoginPage
        onSwitchToRegister={() => setView("register")}
        onLoginSuccess={(token) => {
          setAccessToken(token);
          setView("dashboard");
        }}
      />
    );
  }

  return (
    <DashboardPage
      accessToken={accessToken}
      onAccessTokenChange={setAccessToken}
      onLoggedOut={() => {
        setAccessToken("");
        setView("login");
      }}
    />
  );
}
