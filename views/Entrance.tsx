import React, { useState, useEffect } from 'react';
import { useWebSpeech } from '../hooks/useWebSpeech';
import { TEACHERS } from '../constants';
import { initializeAi } from '../services/geminiService';

interface EntranceProps {
  onEnter: () => void;
  onJudgesEnter: () => void;
}

const APIKeyModal: React.FC<{ onSave: (key: string) => void }> = ({ onSave }) => {
    const [key, setKey] = useState('');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-[#1d1a3e] p-8 rounded-lg shadow-2xl border border-yellow-400 max-w-lg w-11/12 text-center">
                <h2 className="font-cinzel text-2xl text-yellow-300 mb-4">API Key Required</h2>
                <p className="mb-6">To empower the intelligence of our Maestres, a Google Gemini API Key is required.</p>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your API Key..."
                />
                <button
                    onClick={() => onSave(key)}
                    disabled={!key}
                    className="mt-6 w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-300 disabled:bg-gray-500 transition-colors duration-300 font-cinzel"
                >
                    Save and Enter
                </button>
            </div>
        </div>
    );
};

const Entrance: React.FC<EntranceProps> = ({ onEnter, onJudgesEnter }) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY'));
  const [isOpen, setIsOpen] = useState(false);
  const { speak } = useWebSpeech();

  useEffect(() => {
    if (apiKey) {
      initializeAi(apiKey);
    }
  }, [apiKey]);
  
  const handleSaveKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    initializeAi(key);
    setApiKey(key);
  };
  
  const handleEnter = () => {
    if (isOpen) return;
    setIsOpen(true);
    speak(`Welcome to the Maestre Arco Conservatory. An exclusive creation by Richard Felipe Urbina.`, TEACHERS.ARCO.voice);
    setTimeout(onEnter, 4000); // Allow time for animation and speech
  };

  if (!apiKey) {
      return <APIKeyModal onSave={handleSaveKey} />;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center perspective-1000 overflow-hidden">
      <button 
        onClick={onJudgesEnter} 
        className="absolute bottom-4 left-4 z-20 text-gray-500 hover:text-yellow-300 transition-colors font-cinzel text-sm"
      >
        Judges' Entrance
      </button>

      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{backgroundImage: "url('https://i.imgur.com/gOQOqgB.jpeg')", opacity: isOpen ? 1 : 0}}
      >
        <div className="w-full h-full flex items-center justify-center bg-black/30">
            <img 
              src="https://i.imgur.com/U1uBq07.png" 
              alt="Monograma del Conservatorio Maestre Arco" 
              className={`w-1/3 max-w-xs transition-all duration-2000 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
            />
        </div>
      </div>
      
      <div 
        className="relative w-[90vw] h-[95vh] md:w-[60vw] transform-style-3d cursor-pointer z-10"
        onClick={handleEnter}
        aria-label="Enter the Conservatory"
        role="button"
      >
        {/* Left Door */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full bg-[#6F4E37] bg-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] border-r-8 border-black origin-left transition-transform duration-[3000ms] ease-in-out flex items-center justify-end p-4 ${isOpen ? 'rotate-y-[-140deg]' : ''}`}
          style={{boxShadow: 'inset -10px 0 15px -5px rgba(0,0,0,0.5)'}}
        >
           <div className="w-4 h-24 bg-yellow-600 rounded-full shadow-lg"></div>
        </div>
        {/* Right Door */}
        <div
          className={`absolute right-0 top-0 w-1/2 h-full bg-[#6F4E37] bg-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] border-l-8 border-black origin-right transition-transform duration-[3000ms] ease-in-out flex items-center justify-start p-4 ${isOpen ? 'rotate-y-[140deg]' : ''}`}
           style={{boxShadow: 'inset 10px 0 15px -5px rgba(0,0,0,0.5)'}}
        >
          <div className="w-4 h-24 bg-yellow-600 rounded-full shadow-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default Entrance;