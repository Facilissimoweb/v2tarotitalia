import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/siteContent";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { AuthForm } from "../components/AuthForm";
import { LegalNotice, type LegalKind } from "../components/LegalNotice";
import { WidgetFrame } from "../components/WidgetFrame";

const { auth } = siteContent;

export function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/riservata";
  const [mode, setMode] = useState<"login" | "register" | "magic">("login");
  const [legal, setLegal] = useState<LegalKind | null>(null);

  if (session) return <Navigate to={from} replace />;

  return (
    <div>
      <PageHero
        kicker="Soglia riservata"
        title="Accedi"
        lead={siteContent.consulti.accessoObbligatorio}
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ href: "#login", label: "Entra nell'area riservata" }}
      />

      <Reveal>
        <div id="login" className="mx-auto max-w-lg scroll-mt-28 px-6 pb-24 md:px-10 md:pb-32">
          <WidgetFrame title={mode === "login" ? auth.login : mode === "magic" ? auth.magicLink : auth.registrazione}>
            <AuthForm
              mode={mode}
              onMode={setMode}
              redirectTo={from}
              onPrivacy={() => setLegal("privacy")}
              onVendita={() => setLegal("vendita")}
              onSuccess={() => navigate(from, { replace: true })}
            />
          </WidgetFrame>
        </div>
      </Reveal>
      <LegalNotice kind={legal} onClose={() => setLegal(null)} />
    </div>
  );
}
