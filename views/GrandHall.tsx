import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface GrandHallProps {
  profile: StudentProfile;
  onPlanGenerated: (plan: string) => void;
  onLiveTutor: () => void;
}

const GrandHall: React.FC<GrandHallProps> = ({ profile, onPlanGenerated, onLiveTutor }) => {
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createPlan = async () => {
      try {
        const generatedPlan = await generateStudyPlan(profile);
        setPlan(generatedPlan);
      } catch (error)
      {
        console.error("Failed to generate study plan:", error);
        setPlan("The curriculum could not be generated. A cosmic dissonance has occurred. Please, reload the page.");
      } finally {
        setIsLoading(false);
      }
    };
    createPlan();
  }, [profile]);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 md:p-8">
      <h1 className="font-cinzel text-4xl text-yellow-300 mb-4">The Grand Hall</h1>
      <p className="text-lg text-gray-300 mb-8 text-center">Maestre Arco is charting your personal symphony...</p>

      <div className="w-full max-w-4xl h-[70vh] bg-black/40 backdrop-blur-sm rounded-lg border-2 border-yellow-400 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner message="Composing your curriculum..." />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-yellow-300 prose-headings:font-cinzel">
            <pre className="whitespace-pre-wrap font-sans text-base">{plan}</pre>
          </div>
        )}
      </div>
      
      {!isLoading && plan && (
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mt-8 animate-fade-in">
            <button 
              onClick={() => onPlanGenerated(plan)}
              className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 font-cinzel text-xl"
            >
              Begin my first lesson
            </button>
             <button 
              onClick={onLiveTutor}
              className="bg-cyan-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-cyan-300 transition-all duration-300 font-cinzel text-xl"
            >
              Speak with a Live Tutor
            </button>
          </div>
      )}
    </div>
  );
};

export default GrandHall;