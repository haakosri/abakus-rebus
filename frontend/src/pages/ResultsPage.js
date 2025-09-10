// src/pages/ResultsPage.js
import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { getMockLeaderboard } from '../utils/helpers';
import LoadingSpinner from '../components/loadingSpinner';
import LeaderboardTable from '../components/leaderboardTable';
import QRCode from '../components/qrCode';

const ResultsPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLeaderboard(getMockLeaderboard());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="xl" color="indigo" />
          <div className="mt-4 text-xl font-semibold text-indigo-600">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Competition Results</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}. Showing mock data.
          </div>
        )}
        
        {/* Mock QR Code */}
        <QRCode />
        
        <div className="mt-6 flex justify-center mb-8">
          <a
            href="/final"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
          >
            Final results
          </a>
        </div>
        
        {/* Leaderboard section */}
        <LeaderboardTable leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default ResultsPage;
