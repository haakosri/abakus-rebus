import React, { useEffect, useState, useRef } from 'react';
import LoadingSpinner from '../components/loadingSpinner';
import LeaderboardTable from '../components/leaderboardTable';
import Podium from '../components/Podium';
import { getFinalLeaderboard } from '../services/api';

const FinalResultsPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFinalLeaderboard();
        const arr = Array.isArray(data) ? data : [];
        // Show only when there are actual final scores computed
        const scored = arr.filter((e) => (e?.score || 0) > 0);
        setLeaderboard(scored);
        setTop3(scored.slice(0, 3));
        setError(null);
        if (scored.length === 0 && !pollRef.current) {
          pollRef.current = setInterval(fetchData, 5000);
        }
        if (scored.length > 0 && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="xl" color="indigo" />
          <div className="mt-4 text-xl font-semibold text-indigo-600">Loading final results...</div>
        </div>
      </div>
    );
  }

  const isReady = leaderboard && leaderboard.length > 0;

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Final Results</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        {!isReady ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-600">
            Final scores are being calculated. This page will update automatically.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <Podium top3={top3} />
            </div>
            <LeaderboardTable leaderboard={leaderboard} />
          </>
        )}
      </div>
    </div>
  );
};

export default FinalResultsPage;



