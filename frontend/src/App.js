// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SubmitPage from './pages/SubmitPage';
import ResultsPage from './pages/ResultsPage';
import FinalResultsPage from './pages/FinalResultsPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Main app component with routing
const AppRoutes = () => {
  const { auth } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={auth.isAuthenticated ? <Navigate to="/submit" /> : <LoginPage />} 
      />
      <Route 
        path="/submit" 
        element={
          <ProtectedRoute>
            <SubmitPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/final" element={<FinalResultsPage />} />
    </Routes>
  );
};

// Wrap the app with necessary providers
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
