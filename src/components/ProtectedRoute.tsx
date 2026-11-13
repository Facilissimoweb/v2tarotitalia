import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/siteContent";
import { safeInternalPath } from "../lib/siteRoutes";
import { WidgetBrandMark } from "./WidgetFrame";

const { auth } = siteContent;

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center"
        style={{ backgroundColor: "#12100E", color: "#F4F1EA" }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <WidgetBrandMark />
        <p className="max-w-sm text-sm leading-relaxed text-ink/70">{auth.caricamento}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: safeInternalPath(`${location.pathname}${location.search}`) }}
      />
    );
  }
  return children;
}
