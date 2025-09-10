import React, { useState, useEffect, useMemo } from 'react';
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
    { question: 'Hvordan registrere refusjon for el-bil ladning på lønning', correctClassification: 'SupportAI' },
    { question: 'Hvilken momskode skal jeg bruke ved salg til utlandet?', correctClassification: 'Sticos' },
    { question: 'Hvilke kostnadsposter avviker mest fra budsjett i 2024?', correctClassification: 'Innsiktsmodulen' },
    { question: 'Pause under arbeidstid', correctClassification: 'Sticos' },
    { question: 'Kan jeg som administrator endre timelistene til de ansatte?', correctClassification: 'SupportAI' },
    { question: 'Hvordan påvirker finansposter årets resultat?', correctClassification: 'Innsiktsmodulen' },
    { question: 'hvordan får jeg tatt ut næringsspesifikasjon', correctClassification: 'Sticos' },
    { question: 'Hvordan legger jeg til noter i årsregnskapet?', correctClassification: 'SupportAI' },
    { question: 'Hva er total varekostnad, og hvordan avviker den fra budsjett?', correctClassification: 'Innsiktsmodulen' },
    { question: 'Er gaver til samarbeidspartnere regnskapsmessig og skattemessig fradragsberettiget?', correctClassification: 'Sticos' },
    { question: 'Hvordan endrer jeg e-post på en ansatt?', correctClassification: 'SupportAI' },
    { question: 'Hvor mye alkohol kan jeg føre på privat utlegg?', correctClassification: 'Sticos' },
    { question: 'Jeg har udekket tap fra tidligere år, hvordan fører jeg overskudd for i år mot dette?', correctClassification: 'SupportAI' },
    { question: 'Hvordan avskrives driftsmidler etter balanseføring?', correctClassification: 'Sticos' },
    { question: 'Hva er årets faktiske lønnskostnader sammenlignet med budsjett?', correctClassification: 'Innsiktsmodulen' },
    { question: 'Når må jeg sende inn MVA-melding?', correctClassification: 'Sticos' },
    { question: 'Hvordan registrerer jeg en tilbakebetaling?', correctClassification: 'SupportAI' },
    { question: 'hvordan fungerer anleggsregisteret?', correctClassification: 'Sticos' },
    { question: 'Kan noe merkes som sluttfaktura?', correctClassification: 'SupportAI' },
    { question: 'Hvor mye har selskapet tjent i renteinntekter hittil i år?', correctClassification: 'Innsiktsmodulen' },
  ];
  

  const knowledgeBase = [
    {
      title: "Sticos",
      url: "https://www.tripletex.no/om-systemet/sticos-faghjelp/",
      description: "",
      image: ""
    },
    {
      title: "AI assistenten (SupportAI)",
      url: "https://hjelp.tripletex.no/hc/no/articles/30288790756625-Slik-fungerer-AI-assistenten",
      description: "",
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

  const resultsByQuestion = useMemo(() => {
    if (!feedback || !feedback.results) return {};
    const map = {};
    Object.values(feedback.results).forEach((r) => {
      const key = (r.question || '').trim();
      if (key) map[key] = r;
    });
    return map;
  }, [feedback]);

  return (
    <div className="min-h-screen p-4">
      <Header title="AI Classification Challenge" />

      <div className="max-w-6xl mx-auto">
        {/* Top flex container for form and knowledge base */}
        <div className="bg-white rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Submit Solution Section */}
          <div className="p-6">
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Classification challenge</h2>
 */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error: {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Challenge Goal</h3>
                <p className="text-gray-700 mb-4">The goal is to create the best prompt that can correctly classify customer questions into the right category:</p>
                <ul className="list-disc pl-5 mb-4">
                  <li className="text-gray-700">Sticos</li>
                  <li className="text-gray-700">SupportAI</li>
                  <li className="text-gray-700">Innsiktsmodulen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  You have five attempts to create the best prompt.
                </p>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="solution">
                  Your prompt:
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="solution"
                  rows="4"
                  placeholder="Enter your prompt here..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline flex items-center justify-center ${
                  isSubmitting || (feedback && feedback.num_uses >= 5)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                disabled={isSubmitting || (feedback && feedback.num_uses >= 5)}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="md" color="white" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (feedback && feedback.num_uses >= 5) ? 'Maximum attempts reached' : 'Submit'}
              </button>
            </form>
          </div>

          {/* Knowledge Base Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Useful links</h2>
            <div className="space-y-4">
              {knowledgeBase.map((item, index) => (
                <div key={index} className="text-gray-700">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="mb-2">{item.description}</p>
                  <a href={item.url} className="text-blue-600 hover:underline">{item.url}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section (positioned below) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Results:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <div className="mb-4">
              <span className="font-semibold">Your Score: </span>
              <span className={`font-medium text-lg ${feedback && feedback.score > 3 ? 'text-green-600' : 'text-amber-600'}`}>
                {feedback ? `${feedback.score}/${testItems.length}` : 'N/A'}
              </span>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Number of Tries: </span>
              <span className="font-medium text-lg text-gray-800">
                {feedback ? `${feedback.num_uses}/5` : 'N/A'}
              </span>
            </div>
            <div className="mb-6 overflow-x-auto sm:rounded-lg">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3 px-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th scope="col" className="py-3 px-2 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-32">
                          Status
                        </th>
                        <th scope="col" className="py-3 px-2 sm:px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-48">
                          Correct Classification
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testItems.map((item, index) => {
                        const result = resultsByQuestion[item.question.trim()];
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
      </div>
    </div>
  );
};

export default SubmitPage;