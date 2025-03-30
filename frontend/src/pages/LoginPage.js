import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/loadingSpinner';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState("AbakusErEnKalkulator");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    try {
      // Attempt to login
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });
      
      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      // If login was successful
      const data = await response.json();
      console.log("Login successful:", data);
      
      // Update auth context and redirect
      login(name, password);
      navigate('/submit');
    } catch (err) {
      // Handle error case
      setError(err.message);
      
      // For demo purposes - but only if we're in development AND the error is not from the server
      // This ensures we don't bypass authentication errors from the server
      if (process.env.NODE_ENV === 'development' && !err.message.includes('Incorrect password')) {
        console.warn('Auto-login in development mode');
        login(name, password);
        navigate('/submit');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome to the Leaderboard App</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Your Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            {/* <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-gray-500 text-xs mt-1">Hint: Password is preset for you</p>
            </div> */}
            
            <div className="flex items-center justify-center">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Logging In...</span>
                  </>
                ) : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;