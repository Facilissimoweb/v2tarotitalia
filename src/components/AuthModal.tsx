import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { AuthForm } from "./AuthForm";
import { LegalNotice } from "./LegalNotice";
import { WidgetDialog } from "./WidgetDialog";

const { auth } = siteContent;

export function AuthModal() {
  const { authOpen, closeAuth } = useAuth();
  const [legal, setLegal] = useState<"privacy" | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");

  if (!authOpen) return null;

  return (
    <>
      <WidgetDialog title={mode === "login" ? auth.login : auth.registrazione} onClose={closeAuth}>
        <AuthForm
          mode={mode}
          onMode={setMode}
          onPrivacy={() => setLegal("privacy")}
          onSuccess={closeAuth}
        />
      </WidgetDialog>
      <LegalNotice kind={legal} onClose={() => setLegal(null)} />
    </>
  );
}
