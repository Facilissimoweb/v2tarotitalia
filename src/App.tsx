import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ConsentProvider } from "./context/ConsentContext";
import { RitualisticaProvider } from "./context/RitualisticaContext";
import { IthaProvider } from "./context/IthaContext.tsx";
import { LanguageProvider } from "./context/LanguageContext";
import { Layout } from "./components/Layout";
import { CookieBanner } from "./components/CookieBanner";
import { AuthModal } from "./components/AuthModal";
import { RitualisticaModal } from "./components/RitualisticaModal";
import { IthaModal } from "./components/IthaModal.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { ChiSiamo } from "./pages/ChiSiamo";
import { Arcani, ArcanoDetail } from "./pages/Arcani";
import { ArcaniMinori } from "./pages/ArcaniMinori";
import { Consulti } from "./pages/Consulti";
import { Rituali } from "./pages/Rituali";
import { Blog } from "./pages/Blog";
import { Contatti } from "./pages/Contatti";
import { Carrello } from "./pages/Carrello";
import { Corsi } from "./pages/Corsi";
import { Login } from "./pages/Login";
import { Riservata } from "./pages/Riservata";
import { NonTrovata } from "./pages/NonTrovata";
import { ComingSoon } from "./components/ComingSoon";
import { StudioContactDock } from "./components/ContactDock";
import { useSiteAccess } from "./lib/useSiteAccess";

export default function App() {
  const unlocked = useSiteAccess();
  if (!unlocked) return <ComingSoon />;

  return (
    <AuthProvider>
      <ConsentProvider>
        <RitualisticaProvider>
        <LanguageProvider>
        <IthaProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chi-siamo" element={<ChiSiamo />} />
              <Route path="/arcani" element={<Arcani />} />
              <Route path="/arcani/:slug" element={<ArcanoDetail />} />
              <Route path="/arcani-minori" element={<ArcaniMinori />} />
              <Route path="/consulti" element={<Consulti />} />
              <Route path="/rituali" element={<Rituali />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contatti" element={<Contatti />} />
              <Route path="/carrello" element={<Carrello />} />
              <Route path="/corsi" element={<Corsi />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/riservata"
                element={
                  <ProtectedRoute>
                    <Riservata />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NonTrovata />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <CookieBanner />
        <AuthModal />
        <RitualisticaModal />
        <StudioContactDock />
        <IthaModal />
        </IthaProvider>
        </LanguageProvider>
        </RitualisticaProvider>
      </ConsentProvider>
    </AuthProvider>
  );
}
