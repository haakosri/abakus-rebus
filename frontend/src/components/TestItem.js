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
    <tr className="border-b border-gray-200">
      <td className="py-3 px-4 text-sm">
        {question}
      </td>
      <td className="py-3 px-4 w-48 text-center">
        <span className="text-sm font-medium text-gray-800">
          {correctClassification}
        </span>
      </td>
      <td className="py-3 px-4 w-32 text-center">
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getColorClass()} font-bold mr-2`}>
            {getStatusIcon()}
          </span>
          <span className={`text-sm font-medium ${result ? getColorClass() : 'text-gray-400'}`}>
            {getClassification()}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default TestItem;