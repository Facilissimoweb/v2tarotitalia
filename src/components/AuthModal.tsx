import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { AuthForm } from "./AuthForm";
import { LegalNotice, type LegalKind } from "./LegalNotice";
import { WidgetDialog } from "./WidgetDialog";

const { auth } = siteContent;

export function AuthModal() {
  const { authOpen, closeAuth } = useAuth();
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [mode, setMode] = useState<"login" | "register" | "magic">("login");

  if (!authOpen) return null;

  return (
    <>
      <WidgetDialog
        title={mode === "login" ? auth.login : mode === "magic" ? auth.magicLink : auth.registrazione}
        onClose={closeAuth}
      >
        <AuthForm
          mode={mode}
          onMode={setMode}
          onPrivacy={() => setLegal("privacy")}
          onVendita={() => setLegal("vendita")}
          onSuccess={closeAuth}
        />
      </WidgetDialog>
      <LegalNotice kind={legal} onClose={() => setLegal(null)} />
    </>
  );
}
