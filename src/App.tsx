import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { Arcani, ArcanoDetail } from "./pages/Arcani";
import { Consulti } from "./pages/Consulti";
import { Corsi } from "./pages/Corsi";
import { Estrazione } from "./pages/Estrazione";
import { Login } from "./pages/Login";
import { Riservata } from "./pages/Riservata";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/arcani" element={<Arcani />} />
            <Route path="/arcani/:slug" element={<ArcanoDetail />} />
            <Route path="/consulti" element={<Consulti />} />
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
    </AuthProvider>
  );
}
