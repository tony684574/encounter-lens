import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PractitionerHomePage from "./pages/PractitionerHomePage";
import CalendarPage from "./pages/CalendarPage";

import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("encounterLensToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PractitionerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
