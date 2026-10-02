import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ConsentProvider } from "./context/ConsentContext";
import { Layout } from "./components/Layout";
import { CookieBanner } from "./components/CookieBanner";
import { CookieSettingsLaunch } from "./components/CookieSettingsLaunch";
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
import { Estrazione } from "./pages/Estrazione";
import { Login } from "./pages/Login";
import { Riservata } from "./pages/Riservata";

export default function App() {
  return (
    <AuthProvider>
      <ConsentProvider>
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
              <Route path="/estrazione" element={<Estrazione />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/riservata"
                element={
                  <ProtectedRoute>
                    <Riservata />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <CookieBanner />
        <CookieSettingsLaunch />
      </ConsentProvider>
    </AuthProvider>
  );
}
