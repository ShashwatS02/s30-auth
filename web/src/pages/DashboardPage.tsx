import { useEffect, useMemo, useRef, useState } from "react";
import { getMe, logout, logoutAll, refreshSession } from "../api/client";
import StatusBanner from "../components/StatusBanner";
import type { User } from "../types/auth";

type DashboardPageProps = {
  accessToken: string;
  onAccessTokenChange: (token: string) => void;
  onLoggedOut: () => void;
};

function maskToken(token: string) {
  if (!token) return "No access token present";
  if (token.length <= 24) return token;
  return `${token.slice(0, 12)}...${token.slice(-8)}`;
}

export default function DashboardPage({
  accessToken,
  onAccessTokenChange,
  onLoggedOut,
}: DashboardPageProps) {
  const [user, setUser] = useState<User | null>(null);

  const [pageStatus, setPageStatus] = useState("Loading your session...");
  const [pageTone, setPageTone] = useState<"neutral" | "success" | "error">("neutral");

  const [actionStatus, setActionStatus] = useState("");
  const [actionTone, setActionTone] = useState<"neutral" | "success" | "error">("neutral");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);

  const actionsRef = useRef<HTMLElement | null>(null);

  const maskedToken = useMemo(() => maskToken(accessToken), [accessToken]);

  function showActionMessage(
    tone: "neutral" | "success" | "error",
    message: string
  ) {
    setActionTone(tone);
    setActionStatus(message);

    actionsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const res = await getMe(accessToken);
        if (ignore) return;

        setUser(res.user);
        setPageTone("success");
        setPageStatus("Session is active and user data loaded.");
      } catch (err) {
        if (ignore) return;

        setUser(null);
        setPageTone("error");
        setPageStatus(err instanceof Error ? err.message : "Failed to load session");
      }
    }

    if (!accessToken) {
      setUser(null);
      setPageTone("error");
      setPageStatus("Missing access token. Please log in again.");
      return;
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      const res = await refreshSession();
      onAccessTokenChange(res.accessToken);
      setLastRefreshAt(new Date().toLocaleString());

      setPageTone("success");
      setPageStatus("Session is active and user data loaded.");

      showActionMessage("success", "Refresh succeeded and a new access token was issued.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refresh failed";
      setPageTone("error");
      setPageStatus(message);

      showActionMessage("error", message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      onLoggedOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setPageTone("error");
      setPageStatus(message);

      showActionMessage("error", message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleLogoutAll() {
    setIsLoggingOutAll(true);

    try {
      await logoutAll(accessToken);
      onLoggedOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout-all failed";
      setPageTone("error");
      setPageStatus(message);

      showActionMessage("error", message);
    } finally {
      setIsLoggingOutAll(false);
    }
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-wrap">
        <section className="panel">
          <p className="auth-card__eyebrow">s30-auth</p>
          <h1 className="auth-card__title">Session dashboard</h1>
          <p className="auth-card__subtitle">
            A small control room for your current auth state, refresh flow, and session lifecycle.
          </p>
        </section>

        <StatusBanner tone={pageTone} message={pageStatus} />

        <section className="panel">
          <h2>Current user</h2>
          {user ? (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-item__label">User ID</span>
                <span className="info-item__value">{user.id}</span>
              </div>

              <div className="info-item">
                <span className="info-item__label">Email</span>
                <span className="info-item__value">{user.email}</span>
              </div>

              <div className="info-item">
                <span className="info-item__label">Created at</span>
                <span className="info-item__value">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p>No user data loaded yet.</p>
          )}
        </section>

        <section className="panel">
          <h2>Session state</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-item__label">Access token</span>
              <span className="info-item__value">{maskedToken}</span>
            </div>

            <div className="info-item">
              <span className="info-item__label">Refresh flow</span>
              <span className="info-item__value">
                Managed by HttpOnly cookie and rotation on refresh.
              </span>
            </div>

            <div className="info-item">
              <span className="info-item__label">Last refresh</span>
              <span className="info-item__value">
                {lastRefreshAt ?? "Not refreshed in this browser session yet"}
              </span>
            </div>
          </div>
        </section>

        <section className="panel" ref={actionsRef}>
          <h2>Session actions</h2>
          <p>
            Refresh rotates the current refresh token and issues a new access token.
            Logout ends only this current browser session. Logout all sessions revokes every active session for this account.
          </p>

          <StatusBanner tone={actionTone} message={actionStatus} />

          <div className="button-row">
            <button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh session"}
            </button>

            <button
              className="secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>

            <button
              className="secondary danger"
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll}
            >
              {isLoggingOutAll ? "Revoking all..." : "Logout all sessions"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
