// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLandingEditor from "./pages/AdminLandingEditor";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview/landing" element={<LandingPage preview />} />

        {/* Admin */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/landing"
          element={
            <RequireAuth>
              <AdminLandingEditor />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
