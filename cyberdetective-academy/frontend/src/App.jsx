import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Leaderboard from './pages/Leaderboard';
import Teams from './pages/Teams';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminResetViaLink from './pages/AdminResetViaLink';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ExercisePlayer from './components/exercises/ExercisePlayer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/exercises" element={
                <ProtectedRoute>
                  <Exercises />
                </ProtectedRoute>
              } />
              <Route path="/exercises/:id" element={
                <ProtectedRoute>
                  <ExercisePlayer />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/teams" element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              } />
              {/* Rutas de administrador */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/reset-game/:teamId/:token" element={<AdminResetViaLink />} />
              <Route path="/reset-team/:teamId/:token" element={<AdminResetViaLink />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
