import React from 'react';

const TestItem = ({ question, result, correctClassification }) => {
  const getStatusIcon = () => {
    if (!result) return "?";
    return result.correct ? "✓" : "✗";
  };

  const getColorClass = () => {
    if (!result) return "bg-gray-200 text-gray-500";
    return result.correct ? "text-green-600" : "text-red-600";
  };

  const getClassification = () => {
    if (!result) return "";
    return result.classification;
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
        {question}
      </td>
      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
        <span className="text-xs sm:text-sm font-medium text-gray-800">
          {correctClassification}
        </span>
      </td>
      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${getColorClass()} font-bold sm:mr-2 mb-1 sm:mb-0`}>
            {getStatusIcon()}
          </span>
          <span className={`text-xs sm:text-sm font-medium ${result ? getColorClass() : 'text-gray-400'}`}>
            {getClassification()}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default TestItem;