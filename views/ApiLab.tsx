import React, { useEffect, useState } from 'react';
import { TEACHERS } from '../constants';
import { useWebSpeech } from '../hooks/useWebSpeech';

interface ApiLabProps {
  onComplete: () => void;
}

const ApiLab: React.FC<ApiLabProps> = ({ onComplete }) => {
  const teacher = TEACHERS.RIGAB;
  const { speak } = useWebSpeech();
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const speech = `Alright! I'm Maestre Rigab. Welcome to the API Laboratory! This is where the magic happens. At the Conservatory, we don't just give you music; we give you the keys to the future. Our vision, driven by our creator, Richard Felipe Urbina, is to democratise technology. That's why we give you these tools, so you understand the power you hold in your hands. Let's see what it's all about!`;
  
  useEffect(() => {
    speak(speech, teacher.voice);
    const speechDuration = speech.length * 60;
    setTimeout(() => setShowContent(true), 2000);
    setTimeout(() => setShowButton(true), speechDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Card: React.FC<{ title: string; children: React.ReactNode; delay: string }> = ({ title, children, delay }) => (
    <div className={`bg-black/40 p-6 rounded-lg border border-cyan-400/50 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: delay}}>
      <h3 className="font-cinzel text-2xl text-cyan-300 mb-3">{title}</h3>
      <p className="text-gray-300">{children}</p>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 border-t-8 ${teacher.color}`}>
      <div className="text-center mb-8">
        <img src={teacher.image} alt={teacher.name} className={`w-40 h-auto object-contain rounded-lg border-4 ${teacher.color} shadow-2xl mb-4`} />
        <h1 className="font-cinzel text-4xl mb-2">API Laboratory</h1>
        <h2 className="text-2xl text-gray-300">with {teacher.name}</h2>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
        <Card title="What are they?" delay="200ms">
          Think of the Chrome APIs as superpowers for your browser. They are tools that allow your AI Tutor extension to think, understand text, and speak, all without needing an internet connection!
        </Card>
        <Card title="Why do we give them to you?" delay="400ms">
          Because our mission is total democratisation. We don't just give you the fish; we teach you how to fish. We want you to see how technology works, to understand that the power of AI is not a guarded secret, but a tool for everyone.
        </Card>
        <Card title="What are they for?" delay="600ms">
          So that your Maestre can always accompany you. With the extension, you can get summaries of texts, help writing emails, or simply chat about music, on any webpage, at any time. Your education doesn't stop within the Conservatory's halls.
        </Card>
      </div>
      
      {showButton && (
        <button 
          onClick={onComplete} 
          className="mt-12 bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 font-cinzel text-xl animate-fade-in"
        >
          Understood, let's go to the Grand Hall!
        </button>
      )}
    </div>
  );
};

export default ApiLab;