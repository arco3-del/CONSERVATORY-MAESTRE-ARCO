
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, StudentProfile } from '../types';
import { getDiagnosis } from '../services/geminiService';
import { TEACHERS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface DiagnosisProps {
  onComplete: (profile: StudentProfile) => void;
}

const Diagnosis: React.FC<DiagnosisProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { sender: 'ai', text: `Greetings. I am Maestre Arco. To create your musical path, I must get to know you. Please, tell me your name, age, where you are from, what instrument you wish to master, and what your musical dreams are.` }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const profile = await getDiagnosis(newMessages);
      // Success, AI returned a valid profile
      const aiMessage: ChatMessage = { sender: 'ai', text: `Excellent, ${profile.name}. I have understood your essence. Your path is now clear. Prepare to receive your credential.`};
      setMessages([...newMessages, aiMessage]);
      setTimeout(() => onComplete(profile), 3000);
    } catch (error) {
      console.error("Diagnosis Error:", error);
      const errorMessage: ChatMessage = { sender: 'ai', text: "Apologies, there has been a cosmic interference. Please, try to be clearer in your response." };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-black/30 backdrop-blur-sm rounded-lg border-2" style={{borderColor: '#D4AF37'}}>
            <div className="p-4 border-b-2" style={{borderColor: '#D4AF37'}}>
                <h2 className="font-cinzel text-2xl text-center text-yellow-300">Immersive Diagnosis with {TEACHERS.ARCO.name}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && <div className="flex justify-start"><LoadingSpinner message="Analysing..." /></div>}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t-2 flex" style={{borderColor: '#D4AF37'}}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-grow bg-gray-900 text-white p-2 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Reply to the Maestre..."
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-r-lg hover:bg-yellow-300 disabled:bg-gray-500 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
  );
};

export default Diagnosis;