import React, { useRef, useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { useWebCrypto } from '../hooks/useWebCrypto';
import QRCode from 'qrcode';

interface DiplomaProps {
  profile: StudentProfile;
}

const Diploma: React.FC<DiplomaProps> = ({ profile }) => {
  const diplomaRef = useRef<HTMLDivElement>(null);
  const { signData } = useWebCrypto();
  const [issueDate] = useState(new Date());
  
  const getDayWithSuffix = (d: number) => {
    if (d > 3 && d < 21) return d + 'th';
    switch (d % 10) {
      case 1:  return d + "st";
      case 2:  return d + "nd";
      case 3:  return d + "rd";
      default: return d + "th";
    }
  };

  const formatDate = (date: Date) => {
    const day = getDayWithSuffix(date.getDate());
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const generateVerificationQR = async () => {
    const dataToSign = {
        name: profile.name,
        instrument: profile.instrument,
        level: profile.level,
        issuedAt: issueDate.toISOString(),
        issuer: "Maestre Arco Conservatory",
        author: "RICHARD FELIPE URBINA"
    };
    const signature = await signData(JSON.stringify(dataToSign));
    const qrPayload = JSON.stringify({ data: dataToSign, signature });
    
    return QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        width: 128,
        margin: 1,
        color: { dark: '#4a2c1a', light: '#0000' }
    });
  };

  // The download functionality would require a library like html2canvas,
  // which is not available in this environment. We'll simulate the intent.
  const handleDownload = () => {
    alert("The functionality to download the diploma as an image will be implemented. Congratulations on your achievement!");
  };

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  useEffect(() => {
    generateVerificationQR().then(setQrCodeUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#d4af37] to-[#8a652a]">
        <div 
          ref={diplomaRef}
          className="parchment-bg w-full max-w-4xl aspect-[1.414] p-8 md:p-12 flex flex-col items-center text-center relative"
        >
            <div className="absolute top-8 left-8">
                <img src="https://i.imgur.com/dO2bB6A.png" alt="Conservatory Logo" className="w-24 h-24 opacity-80" />
            </div>

            <h1 className="font-cinzel text-5xl md:text-6xl font-bold tracking-wider" style={{ color: '#5a3d2b' }}>
                CERTIFICATE OF MASTERY
            </h1>
            <p className="font-cinzel text-xl mt-4">Awarded to</p>

            <p className="font-cinzel text-4xl md:text-5xl my-8 border-b-2 border-t-2 border-yellow-800 py-4 px-8">
                {profile.name}
            </p>

            <p className="max-w-xl text-lg">
                For having completed with distinction the Level <strong>{profile.level}</strong> curriculum in the discipline of <strong>{profile.instrument}</strong>, demonstrating notable dedication, talent, and passion for the musical arts.
            </p>

            <div className="flex-grow"></div>

            <div className="flex items-end justify-between w-full mt-12">
                <div className="text-center">
                    <p className="font-cinzel text-lg signature" style={{fontFamily: "'Brush Script MT', cursive", fontSize: '2rem'}}>Maestre Arco</p>
                    <p className="border-t-2 border-yellow-800 pt-1 font-cinzel text-sm">DIRECTOR</p>
                </div>
                <div className="text-center">
                   {qrCodeUrl && <img src={qrCodeUrl} alt="Verification QR Code" className="w-32 h-32" />}
                   <p className="text-xs -mt-2">VERIFICATION SEAL</p>
                </div>
                <div className="text-center">
                    <p className="font-cinzel text-lg signature" style={{fontFamily: "'Brush Script MT', cursive", fontSize: '2rem'}}>Richard Felipe Urbina</p>
                    <p className="border-t-2 border-yellow-800 pt-1 font-cinzel text-sm">CREATOR & ARCHITECT</p>
                </div>
            </div>
             <p className="w-full text-center mt-4 text-sm font-cinzel border-t border-dashed border-yellow-900/50 pt-2 text-yellow-900">
                Issued on {formatDate(issueDate)}
            </p>
        </div>
        <button 
            onClick={handleDownload}
            className="mt-8 bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 transition-all duration-300 font-cinzel text-xl border border-white/50"
        >
            Download Certificate
        </button>
    </div>
  );
};

export default Diploma;