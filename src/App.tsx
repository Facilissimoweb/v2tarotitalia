import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ConsentProvider } from "./context/ConsentContext";
import { PercorsiProvider } from "./context/PercorsiContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Layout } from "./components/Layout";
import { CookieBanner } from "./components/CookieBanner";
import { AuthModal } from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { ComingSoon } from "./components/ComingSoon";
import { StudioContactDock } from "./components/ContactDock";
import { BackToTop } from "./components/BackToTop";
import { useSiteAccess } from "./lib/useSiteAccess";

const PercorsiModal = lazy(() =>
  import("./components/PercorsiModal").then((m) => ({ default: m.PercorsiModal })),
);
const AccessibilityPanel = lazy(() =>
  import("./components/AccessibilityWidget").then((m) => ({ default: m.AccessibilityPanel })),
);
const TarotChat = lazy(() =>
  import("./components/TarotChat").then((m) => ({ default: m.TarotChat })),
);
const ShopLaunch = lazy(() =>
  import("./components/ShopLaunch").then((m) => ({ default: m.ShopLaunch })),
);

const ChiSiamo = lazy(() => import("./pages/ChiSiamo").then((m) => ({ default: m.ChiSiamo })));
const Arcani = lazy(() => import("./pages/Arcani").then((m) => ({ default: m.Arcani })));
const ArcanoDetail = lazy(() =>
  import("./pages/Arcani").then((m) => ({ default: m.ArcanoDetail })),
);
const ArcaniMinori = lazy(() =>
  import("./pages/ArcaniMinori").then((m) => ({ default: m.ArcaniMinori })),
);
const ArcanoMinoreDetail = lazy(() =>
  import("./pages/ArcaniMinori").then((m) => ({ default: m.ArcanoMinoreDetail })),
);
const Consulti = lazy(() => import("./pages/Consulti").then((m) => ({ default: m.Consulti })));
const Percorsi = lazy(() => import("./pages/Percorsi").then((m) => ({ default: m.Percorsi })));
const Blog = lazy(() => import("./pages/Blog").then((m) => ({ default: m.Blog })));
const Contatti = lazy(() => import("./pages/Contatti").then((m) => ({ default: m.Contatti })));
const Carrello = lazy(() => import("./pages/Carrello").then((m) => ({ default: m.Carrello })));
const Shop = lazy(() => import("./pages/Shop").then((m) => ({ default: m.Shop })));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const Riservata = lazy(() => import("./pages/Riservata").then((m) => ({ default: m.Riservata })));
const NonTrovata = lazy(() =>
  import("./pages/NonTrovata").then((m) => ({ default: m.NonTrovata })),
);
const Privacy = lazy(() => import("./pages/Privacy").then((m) => ({ default: m.Privacy })));
const Disclaimer = lazy(() =>
  import("./pages/Disclaimer").then((m) => ({ default: m.Disclaimer })),
);
const TerminiDiServizio = lazy(() =>
  import("./pages/TerminiDiServizio").then((m) => ({ default: m.TerminiDiServizio })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-ivory px-6 text-sm text-ink/60" aria-hidden>
      …
    </div>
  );
}

export default function App() {
  const unlocked = useSiteAccess();
  if (!unlocked) return <ComingSoon />;

  return (
    <AuthProvider>
      <ConsentProvider>
        <PercorsiProvider>
        <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route
                path="/chi-sono"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ChiSiamo />
                  </Suspense>
                }
              />
              <Route path="/chi-siamo" element={<Navigate to="/chi-sono" replace />} />
              <Route
                path="/arcani"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Arcani />
                  </Suspense>
                }
              />
              <Route
                path="/arcani/:slug"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ArcanoDetail />
                  </Suspense>
                }
              />
              <Route
                path="/arcani-minori"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ArcaniMinori />
                  </Suspense>
                }
              />
              <Route
                path="/arcani-minori/:slug"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ArcanoMinoreDetail />
                  </Suspense>
                }
              />
              <Route
                path="/consulti"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Consulti />
                  </Suspense>
                }
              />
              <Route
                path="/percorsi"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Percorsi />
                  </Suspense>
                }
              />
              <Route path="/rituali" element={<Navigate to="/percorsi" replace />} />
              <Route
                path="/blog"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Blog />
                  </Suspense>
                }
              />
              <Route
                path="/contatti"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Contatti />
                  </Suspense>
                }
              />
              <Route
                path="/carrello"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Carrello />
                  </Suspense>
                }
              />
              <Route
                path="/shop"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Shop />
                  </Suspense>
                }
              />
              <Route path="/corsi" element={<Navigate to="/shop" replace />} />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="/riservata"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<RouteFallback />}>
                      <Riservata />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Privacy />
                  </Suspense>
                }
              />
              <Route
                path="/disclaimer"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Disclaimer />
                  </Suspense>
                }
              />
              <Route
                path="/termini-di-servizio"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <TerminiDiServizio />
                  </Suspense>
                }
              />
              <Route path="/termini" element={<Navigate to="/termini-di-servizio" replace />} />
              <Route
                path="*"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <NonTrovata />
                  </Suspense>
                }
              />
            </Route>
          </Routes>
          <CookieBanner />
          <AuthModal />
          <StudioContactDock />
          <BackToTop />
          <Suspense fallback={null}>
            <PercorsiModal />
            <TarotChat />
            <ShopLaunch />
            <AccessibilityPanel />
          </Suspense>
        </BrowserRouter>
        </LanguageProvider>
        </PercorsiProvider>
      </ConsentProvider>
    </AuthProvider>
  );
}
