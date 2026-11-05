import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearAuthReturn, readAuthReturn, resolvePostAuthPath } from "../lib/authReturn";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageStackEngine } from "./StackSheet";
import { LanguageSeo } from "./LanguageSeo";
import { SeoManager } from "../lib/pageSeo";
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
  const prevPath = useRef<string | null>(null);
  useEffect(() => {
    pageSpeech.stop();
  }, [pathname]);
  useEffect(() => {
    const first = prevPath.current === null;
    const pathChanged = prevPath.current !== pathname;
    prevPath.current = pathname;

    if (!hash) {
      if (first || pathChanged) window.scrollTo(0, 0);
      return;
    }

    // Click su ancora della stessa pagina: lo scroll nativo basta.
    // Un secondo scrollIntoView compete sullo smooth e su touch lascia la pagina in blocco.
    if (!first && !pathChanged) return;

    const id = decodeURIComponent(hash.replace(/^#/, ""));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-ivory text-ink">
      <PageSpeechSkipLink />
      <ScrollToTop />
      <PostAuthBounce />
      <LanguageSeo />
      <SeoManager />
      <Header />
      <PageStackEngine />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
