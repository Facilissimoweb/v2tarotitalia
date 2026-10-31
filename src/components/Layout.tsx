import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearAuthReturn, readAuthReturn, resolvePostAuthPath } from "../lib/authReturn";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LanguageSeo } from "./LanguageSeo";
import { PageSpeechSkipLink } from "./PageSpeech";
import { pageSpeech } from "../lib/pageSpeech";

function PostAuthBounce() {
  const { session, ready } = useAuth();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !session) return;
    if (pathname !== "/") return;
    if (!readAuthReturn()) return;
    const fromState = (state as { from?: string } | null)?.from;
    const fromQuery = new URLSearchParams(search).get("from");
    const target = resolvePostAuthPath(fromState ?? fromQuery);
    clearAuthReturn();
    if (target && target !== pathname) navigate(target, { replace: true });
  }, [ready, session, pathname, search, state, navigate]);

  return null;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    pageSpeech.stop();
  }, [pathname]);
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-ivory text-ink">
      <PageSpeechSkipLink />
      <ScrollToTop />
      <PostAuthBounce />
      <LanguageSeo />
      <Header />
      <main className="min-w-0 flex-1 overflow-x-hidden pt-[calc(80px+env(safe-area-inset-top,0px))] xl:pt-[calc(112px+env(safe-area-inset-top,0px))]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
