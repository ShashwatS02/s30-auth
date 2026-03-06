import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: AuthCardProps) {
  return (
    <section className="auth-card">
      <div className="auth-card__header">
        <p className="auth-card__eyebrow">s30-auth</p>
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__subtitle">{subtitle}</p>
      </div>

      <div className="auth-card__body">{children}</div>

      {footer ? <div className="auth-card__footer">{footer}</div> : null}
    </section>
  );
}
