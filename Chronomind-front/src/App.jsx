import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Login from "./components/Login/Login";
import Register from "./components/Login/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import MindMap from "./components/MindMap/MindMapPage";
import Goals from "./components/Goals/Page";
import Tasks from "./components/Tasks/TaskPage";
import Habits from "./components/Habits/habits";
import Studyes from "./components/Studies/Studies";
import Charts from "./components/Charts/Analytics";
import Profile from "./components/Profile/Profile";

export default function App() {
  const { user, loadingUser } = useAuth();
  const location = useLocation();

  if (loadingUser) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login key={location.key} />} />
      <Route path="/register" element={<Register key={location.key} />} />

      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/mindmap"
        element={user ? <MindMap /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/goals"
        element={user ? <Goals /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/tasks"
        element={user ? <Tasks /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/habits"
        element={user ? <Habits /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/studyes"
        element={user ? <Studyes /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/charts"
        element={user ? <Charts /> : <Navigate to="/login" replace />}
      />


      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
