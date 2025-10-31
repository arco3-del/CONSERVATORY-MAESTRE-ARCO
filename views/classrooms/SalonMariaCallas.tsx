
import React from 'react';
import { StudentProfile } from '../../types';
import { TEACHERS } from '../../constants';
import { useWebSpeech } from '../../hooks/useWebSpeech';

interface SalonMariaCallasProps {
    profile: StudentProfile;
    studyPlan: string;
    onComplete: () => void;
}

const SalonMariaCallas: React.FC<SalonMariaCallasProps> = ({ profile, onComplete }) => {
  const teacher = TEACHERS.ARCOIDA;
  const { speak } = useWebSpeech();

  React.useEffect(() => {
    speak(`Enter, ${profile.name}! You have arrived at the Salon Maria Callas. Here, your voice is your power. I am ${teacher.name}, and we shall forge your breath into thunder.`, teacher.voice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, profile.name]);
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 border-t-8 ${teacher.color}`}>
      <img src={teacher.image} alt={teacher.name} className={`w-56 h-80 object-cover rounded-lg border-4 ${teacher.color} shadow-2xl mb-8`} />
      <h1 className="font-cinzel text-4xl mb-2">{teacher.salon}</h1>
      <h2 className="text-2xl text-gray-300 mb-8">with {teacher.name}</h2>
      <p className="text-center max-w-xl mb-8">
        {teacher.personality}
      </p>
       <div className="bg-black/30 p-6 rounded-lg w-full max-w-2xl mb-8">
          <p className="text-center font-cinzel text-pink-400 text-lg mb-4">Coming soon:</p>
          <ul className="list-disc list-inside text-center text-gray-300">
            <li>Tone and pitch analysis (Web Audio API)</li>
            <li>Guided vocalisation exercises</li>
            <li>Interactive repertoire with 45 pieces per level</li>
          </ul>
      </div>
       <button onClick={onComplete} className="bg-green-500 text-white font-bold py-2 px-8 rounded-lg hover:bg-green-400 transition-all duration-300 font-cinzel text-lg">
        Finish Lesson
      </button>
    </div>
  );
};

export default SalonMariaCallas;