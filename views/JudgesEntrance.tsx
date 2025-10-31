import React, { useState, useEffect } from 'react';
import { JUDGES } from '../constants';
import { useWebCrypto } from '../hooks/useWebCrypto';
import { createStyledQrCode } from '../utils/qrUtils';
import LoadingSpinner from '../components/LoadingSpinner';

interface JudgesEntranceProps {
  onExit: () => void;
}

const JudgesEntrance: React.FC<JudgesEntranceProps> = ({ onExit }) => {
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { signData } = useWebCrypto();

  useEffect(() => {
    const generateAllQRs = async () => {
      const generatedQRs: { [key: string]: string } = {};
      for (const judge of JUDGES) {
        try {
          const dataToSign = { name: judge.name, title: judge.title, role: 'Judge', author: "RICHARD FELIPE URBINA" };
          const signature = await signData(JSON.stringify(dataToSign));
          const qrPayload = JSON.stringify({ data: dataToSign, signature });
          const qrUrl = await createStyledQrCode(qrPayload, { width: 200 });
          generatedQRs[judge.name] = qrUrl;
        } catch (error) {
          console.error(`Failed to generate QR for ${judge.name}:`, error);
          generatedQRs[judge.name] = ''; // Handle error case
        }
      }
      setQrCodes(generatedQRs);
      setIsLoading(false);
    };
    generateAllQRs();
  }, [signData]);

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-cinzel text-4xl text-yellow-300">Judges' Honour Credentials</h1>
        <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors">
          &larr; Return to Entrance
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-20">
          <LoadingSpinner message="Forging honour passes..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {JUDGES.map((judge) => (
            <div key={judge.name} className="parchment-bg p-6 flex flex-col items-center text-center animate-fade-in">
              <img 
                src={judge.image} 
                alt={judge.name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-800/50 shadow-lg mb-4"
              />
              <h2 className="font-cinzel text-2xl font-bold">{judge.name}</h2>
              <p className="text-sm mb-4 h-10">{judge.title}</p>
              {qrCodes[judge.name] ? (
                 <div className="p-2 bg-white/50 rounded-lg inline-block border border-black/20" style={{backgroundImage: "url('https://i.imgur.com/8R0g3iB.png')", backgroundSize: 'cover'}}>
                    <img src={qrCodes[judge.name]} alt={`QR Code for ${judge.name}`} className="w-40 h-40"/>
                 </div>
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-lg">
                  <p className="text-xs text-red-800">Error generating QR</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JudgesEntrance;