import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/loadingSpinner';
import LeaderboardTable from '../components/leaderboardTable';
import Podium from '../components/Podium';
import { getFinalLeaderboard } from '../services/api';

const FinalResultsPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getFinalLeaderboard();
        setLeaderboard(data);
        setTop3(data.slice(0, 3));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Final Results</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <Podium top3={top3} />
        </div>
        <LeaderboardTable leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default FinalResultsPage;



