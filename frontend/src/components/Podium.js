// src/components/Podium.js
import React from 'react';
import { calculatePodiumHeight } from '../utils/helpers';

const Podium = ({ top3 }) => {
  if (!top3 || top3.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No data available for podium</p>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-end h-80 space-x-10 mt-8">
      {/* Second Place */}
      {top3.length >= 2 && (
        <div className="flex flex-col items-center">
          <div className="text-lg font-medium mb-4">{top3[1].name}</div>
          <div 
            className="podium-second w-28 flex items-center justify-center rounded-t-md text-white"
            style={{ height: calculatePodiumHeight(top3[1].score, 2) }}
          >
            <span className="font-bold text-2xl">{top3[1].score}</span>
          </div>
          <div className="bg-gray-400 w-36 h-10 flex items-center justify-center text-white font-bold rounded-b-md">
            2nd Place
          </div>
        </div>
      )}
      
      {/* First Place - Larger and more celebratory */}
      {top3.length >= 1 && (
        <div className="flex flex-col items-center scale-110">
          <div className="text-2xl font-extrabold mb-4 text-yellow-600 flex items-center gap-2">
            <span>🏆</span>
            <span>{top3[0].name}</span>
            <span>🏆</span>
          </div>
          <div 
            className="podium-first w-36 flex items-center justify-center rounded-t-md text-white ring-4 ring-yellow-300"
            style={{ height: calculatePodiumHeight(top3[0].score, 1) }}
          >
            <span className="font-extrabold text-4xl drop-shadow">{top3[0].score}</span>
          </div>
          <div className="bg-yellow-500 w-44 h-16 flex items-center justify-center text-white font-extrabold rounded-b-md text-xl shadow-md">
            👑 1st Place
          </div>
        </div>
      )}
      
      {/* Third Place */}
      {top3.length >= 3 && (
        <div className="flex flex-col items-center">
          <div className="text-lg font-medium mb-4">{top3[2].name}</div>
          <div 
            className="podium-third w-24 flex items-center justify-center rounded-t-md text-white"
            style={{ height: calculatePodiumHeight(top3[2].score, 3) }}
          >
            <span className="font-bold text-xl">{top3[2].score}</span>
          </div>
          <div className="bg-amber-800 w-32 h-8 flex items-center justify-center text-white font-bold rounded-b-md">
            3rd Place
          </div>
        </div>
      )}
    </div>
  );
};

export default Podium;
