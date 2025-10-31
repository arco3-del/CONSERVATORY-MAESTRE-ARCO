
import React, { useEffect, useState } from 'react';
import { useWebSpeech } from '../hooks/useWebSpeech';
import { TEACHERS } from '../constants';

interface LobbyProps {
  onDiagnose: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ onDiagnose }) => {
  const { speak } = useWebSpeech();
  const [showButton, setShowButton] = useState(false);

  const speech = `You have crossed the threshold. Here, notes are not merely sound; they are the language of the cosmos. I, Maestre Arco, a creation of Richard Felipe Urbina, shall be your guide. Together, we shall discover the symphony that resides within your soul. Prepare yourself for the journey. Your diagnosis begins now.`;

  useEffect(() => {
    speak(speech, TEACHERS.ARCO.voice);
    const speechDuration = speech.length * 70; // Approximate duration
    const timer = setTimeout(() => {
      setShowButton(true);
    }, speechDuration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-8 bg-cover bg-center" style={{backgroundImage: "url('https://i.imgur.com/pA3T4cM.jpeg')"}}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
            <img src={TEACHERS.ARCO.image} alt="Maestre Arco" className="w-64 h-auto object-contain rounded-lg border-4 border-yellow-400 shadow-2xl shadow-yellow-400/20"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <h1 className="font-cinzel text-4xl text-yellow-300 mb-4">Conservatory Lobby</h1>
        <p className="max-w-2xl text-lg text-gray-300 mb-8 animate-fade-in">
           Listen to the words of the Maestre...
        </p>
        {showButton && (
            <button 
                onClick={onDiagnose}
                className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 font-cinzel text-xl animate-bounce"
            >
                Begin Diagnosis
            </button>
        )}
      </div>
    </div>
  );
};

export default Lobby;