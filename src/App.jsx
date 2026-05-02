import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HealthuChat from './components/HealthuChat';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/PatientDashboard';
import RecordUpload from './pages/RecordUpload';
import Timeline from './pages/Timeline';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientView from './pages/PatientView';

function ProtectedRoute({ children, role }) {
  const { user, userData, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!userData) return <Navigate to="/onboarding" />;
  if (role && userData.role !== role) {
    return <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }
  
  return children;
}

function Home() {
  const { user, userData, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!userData) return <Navigate to="/onboarding" />;
  
  return <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/upload" element={
              <ProtectedRoute role="patient">
                <RecordUpload />
              </ProtectedRoute>
            } />
            <Route path="/patient/timeline" element={
              <ProtectedRoute role="patient">
                <Timeline />
              </ProtectedRoute>
            } />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patient/:id" element={
              <ProtectedRoute role="doctor">
                <PatientView />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {user && <HealthuChat />}
      </div>
    </Router>
  );
}
