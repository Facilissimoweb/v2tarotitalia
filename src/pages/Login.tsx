import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/siteContent";
import { readBookingDraft } from "../lib/storage";
import { safeInternalPath } from "../lib/siteRoutes";
import { PageBanner } from "../components/PageBanner";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { AuthForm } from "../components/AuthForm";
import { LegalNotice, type LegalKind } from "../components/LegalNotice";
import { WidgetFrame } from "../components/WidgetFrame";

const { auth, nav } = siteContent;

export function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pending = Boolean(readBookingDraft());
  const from = safeInternalPath(
    (location.state as { from?: string } | null)?.from ?? (pending ? "/carrello" : "/riservata"),
  );
  const [mode, setMode] = useState<"login" | "register" | "magic">("login");
  const [legal, setLegal] = useState<LegalKind | null>(null);

  if (session) return <Navigate to={from} replace />;

  const form = (
    <AuthForm
      mode={mode}
      onMode={setMode}
      soglia={pending}
      redirectTo={from}
      onPrivacy={() => setLegal("privacy")}
      onVendita={() => setLegal("vendita")}
      onSuccess={() => navigate(from, { replace: true })}
    />
  );

  return (
    <div>
      {pending ? (
        <PageBanner title={auth.sogliaTitolo} subtitle={auth.sogliaLead} className="mb-10 md:mb-14" />
      ) : (
        <PageHero
          kicker={nav.riservata}
          title={nav.accedi}
          lead={siteContent.consulti.accessoObbligatorio}
          cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
          secondary={{ href: "#login", label: nav.riservata }}
        />
      )}

      <Reveal>
        <div id="login" className="mx-auto max-w-lg scroll-mt-28 px-6 pb-24 md:px-10 md:pb-32">
          {pending ? form : (
            <WidgetFrame title={mode === "login" ? auth.login : mode === "magic" ? auth.magicLink : auth.registrazione}>
              {form}
            </WidgetFrame>
          )}
        </div>
      </Reveal>
      <LegalNotice kind={legal} onClose={() => setLegal(null)} />
    </div>
  );
}
