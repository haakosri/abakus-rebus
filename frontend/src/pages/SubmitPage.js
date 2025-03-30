import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TestItem from '../components/TestItem';
import LoadingSpinner from '../components/loadingSpinner';
import { submitSolution } from '../services/api';
import chatImage from '../images/chat.png'; // Import the image

const SubmitPage = () => {
  const { auth, logout } = useAuth();
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const testItems = [
    { question: 'Hvordan registrerer jeg en tilbakebetaling?', correctClassification: 'SupportAI' },
    { question: 'Hvor mye alkohol kan jeg føre på privat utlegg?', correctClassification: 'Sticos' },
    { question: 'Hvordan avskrives driftsmidler etter balanseføring?', correctClassification: 'Sticos' },
    { question: 'Pause under arbeidstid', correctClassification: 'Sticos' },
    { question: 'Kan jeg som administrator endre timelistene til de ansatte?', correctClassification: 'SupportAI' },
    { question: 'Hvordan legger jeg til noter i årsregnskapet?', correctClassification: 'SupportAI' },
    { question: 'Når må jeg sende inn MVA-melding?', correctClassification: 'Sticos' },
    { question: 'returmelding Altinn', correctClassification: 'SupportAI' },
    { question: 'Skal en kapitalforhøyelse regnskapsføres før den er registrert?', correctClassification: 'Sticos' },
    { question: 'Hvilken momskode skal jeg bruke ved salg til utlandet?', correctClassification: 'Sticos' },
    { question: 'nedskrive tilhenger', correctClassification: 'Sticos' },
    { question: 'Er gaver til samarbeidspartnere regnskapsmessig og skattemessig fradragsberettiget?', correctClassification: 'Sticos' },
    { question: 'Feil på innsending av årsrgnskap', correctClassification: 'SupportAI' },
    { question: 'Hvordan endrer jeg e-post på en ansatt?', correctClassification: 'SupportAI' },
    { question: 'mva', correctClassification: 'Sticos' },
  ];

  const knowledgeBase = [
    {
      title: "Tripletex",
      url: "tripletex.no",
      description: "Her er link til Tripletex.",
      image: ""
    },
    {
      title: "Sticos",
      url: "https://www.tripletex.no/om-systemet/sticos-faghjelp/",
      description: "Her finner dere informasjon om Sticos og deres produkter. Zipp er navnet på produktet vi bruker.",
      image: ""
    },
    {
      title: "Zipp",
      url: "https://www.sticos.no/produkter/sticos-oppslag/zipp/",
      description: "Her finner dere informasjon om Zipp.",
      image: ""
    },
    {
      title: "OpenAI Structured Outputs",
      url: "https://platform.openai.com/docs/guides/structured-outputs",
      description: "Vi bruker OpenAI for å evaluere løsningene. Spesifikt structured outputs. output er da tvungen til å være [Sticos/SupportAI/Other].",
      image: ""
    },
    {
      title: "Standard Chat in Tripletex",
      url: "",
      description: "Standard chat in Tripletex",
      image: chatImage // Use the imported image
    },
    {
      title: "Slik fungerer AI assistenten",
      url: "https://hjelp.tripletex.no/hc/no/articles/30288790756625-Slik-fungerer-AI-assistenten",
      description: "Slik fungerer AI assistenten",
      image: ""
    }
  ];

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!auth || !auth.isAuthenticated) {
          navigate('/');
        }
      } catch (err) {
        console.error("Authentication verification failed:", err);
        logout();
        navigate('/');
      }
    };

    verifyAuth();
  }, [auth, logout, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!solution.trim()) {
      setError("Please enter your solution");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitSolution(auth.name, auth.password, solution);

      if (response.status === 401) {
        logout();
        navigate('/');
        return;
      }

      setFeedback(response);
    } catch (error) {
      console.error(error);
      setError(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <Header title="Submit Your Solution" />

      <div className="max-w-6xl mx-auto">
        {/* Top flex container for form and knowledge base */}
        <div className="bg-white rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Submit Solution Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit Your Solution</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error: {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="solution">
                  Your solution:
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="solution"
                  rows="4"
                  placeholder="Enter your solution here..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="md" color="white" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : 'Submit Solution'}
              </button>
            </form>
          </div>

          {/* Knowledge Base Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Knowledge Base</h2>
            <ul className="list-disc pl-5 space-y-4">
              {knowledgeBase.map((item, index) => (
                <li key={index} className="flex items-start space-x-4">
                  <div>
                    <details>
                      <summary className="text-blue-600 hover:underline cursor-pointer">{item.title}</summary>
                      {item.image && (
                        <img src={item.image} alt="Knowledge Base" className="w-full max-w-xs object-cover rounded mt-2" />
                      )}
                      <a href={item.url} className="text-blue-600 hover:underline">{item.url}</a>
                      <p className="text-gray-600">{item.description}</p>
                    </details>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results Section (positioned below) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Results:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="mb-4">
              <span className="font-semibold">Your Score: </span>
              <span className={`font-medium text-lg ${feedback && feedback.score > 3 ? 'text-green-600' : 'text-amber-600'}`}>
                {feedback ? `${feedback.score}/15` : 'N/A'}
              </span>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Number of Tries: </span>
              <span className="font-medium text-lg text-gray-800">
                {feedback ? `${feedback.num_uses}/5` : 'N/A'}
              </span>
            </div>
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Correct Classification
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testItems.map((item, index) => {
                    const result = feedback && feedback.results && feedback.results[index];
                    return (
                      <TestItem
                        key={index}
                        question={item.question}
                        result={result}
                        correctClassification={item.correctClassification}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;