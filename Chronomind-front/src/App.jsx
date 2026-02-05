import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./contexts/AuthContext";

import PageFade from "./components/Login/LoginAnimation/PageFade";
import Loading from "./Loading/Loading";
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

if (loadingUser) {
  return <Loading text="Inicializando sistema..." />
}

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route
          path="/login"
          element={
            <PageFade>
              <Login />
            </PageFade>
          }
        />

        <Route
          path="/register"
          element={
            <PageFade>
              <Register />
            </PageFade>
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <PageFade>
                <Dashboard />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/mindmap"
          element={
            user ? (
              <PageFade>
                <MindMap />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/goals"
          element={
            user ? (
              <PageFade>
                <Goals />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/tasks"
          element={
            user ? (
              <PageFade>
                <Tasks />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/habits"
          element={
            user ? (
              <PageFade>
                <Habits />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/studyes"
          element={
            user ? (
              <PageFade>
                <Studyes />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/charts"
          element={
            user ? (
              <PageFade>
                <Charts />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user ? (
              <PageFade>
                <Profile />
              </PageFade>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={user ? "/dashboard" : "/login"}
              replace
            />
          }
        />

      </Routes>
    </AnimatePresence>
  );
}
