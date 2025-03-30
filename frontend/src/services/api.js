const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const loginUser = async (name, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return await response.json();
};

export const submitSolution = async (name, password, solution) => {
  const response = await fetch(`${API_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, solution }), // password, 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Submission failed');
  }
  return await response.json();
};

export const getLeaderboard = async () => {
  const response = await fetch(`${API_URL}/leaderboard`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  
  return await response.json();
};

export const getTop3 = async () => {
  const response = await fetch(`${API_URL}/top3`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch top 3');
  }
  
  return await response.json();
};