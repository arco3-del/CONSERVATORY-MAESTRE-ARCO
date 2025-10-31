
import React from 'react';
import { StudentProfile } from '../../types';
import { TEACHERS } from '../../constants';
import { useWebSpeech } from '../../hooks/useWebSpeech';

interface GranSalonInstrumentoProps {
    profile: StudentProfile;
    studyPlan: string;
    onComplete: () => void;
}

const GranSalonInstrumento: React.FC<GranSalonInstrumentoProps> = ({ profile, onComplete }) => {
  const teacher = TEACHERS.ARCO;
  const { speak } = useWebSpeech();

  React.useEffect(() => {
    speak(`Welcome to your sanctuary, ${profile.name}. In this Grand Hall, the instrument and your soul shall become one. I am ${teacher.name}, and your practice begins here.`, teacher.voice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, profile.name]);
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 border-t-8 ${teacher.color}`}>
      <div className="text-center mb-8">
        <img src={teacher.image} alt={teacher.name} className={`w-40 h-auto object-contain rounded-lg border-4 ${teacher.color} shadow-2xl mb-4`} />
        <h1 className="font-cinzel text-4xl mb-2">{teacher.salon}</h1>
        <h2 className="text-2xl text-gray-300">with {teacher.name}</h2>
      </div>

      <div className="w-full max-w-3xl p-6 rounded-lg parchment-bg">
        <h3 className="font-cinzel text-3xl text-center mb-4 font-bold">My Daily Exercise</h3>
        
        <div className="bg-white/70 p-4 rounded-md mb-4 border border-black/20">
            <div 
              className="h-36 w-full bg-contain bg-center bg-no-repeat"
              style={{backgroundImage: "url('https://i.imgur.com/qW1d1gA.png')"}}
              aria-label="Placeholder for musical score"
            >
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-around items-center mb-6 space-y-4 sm:space-y-0">
            <button className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg font-cinzel hover:bg-gray-700 transition-colors border border-black/50 shadow-md">
                Create a Simple Score
            </button>
            <button className="bg-yellow-600 text-white font-bold py-2 px-5 rounded-lg font-cinzel hover:bg-yellow-700 transition-colors border border-black/50 shadow-md">
                Analyse with AI
            </button>
        </div>

        <div className="border-t-2 border-dashed border-black/20 my-4"></div>

        <div>
            <h4 className="font-cinzel text-xl font-bold mb-2">KEY Concepts</h4>
            <ul className="list-disc list-inside space-y-1 text-base">
                <li>Sonata form is a fundamental structure.</li>
                <li>Modern musical notation has its roots in Gregorian chant.</li>
                <li>The circle of fifths is key to understanding tonal harmony.</li>
                <li>Deliberate practice is more effective than unfocused repetition.</li>
            </ul>
        </div>
      </div>
       <button onClick={onComplete} className="mt-8 bg-green-500 text-white font-bold py-2 px-8 rounded-lg hover:bg-green-400 transition-all duration-300 font-cinzel text-lg">
        Finish Lesson
      </button>
    </div>
  );
};

export default GranSalonInstrumento;