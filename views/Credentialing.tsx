import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StudentProfile, StudentCredential } from '../types';
import { useWebCrypto } from '../hooks/useWebCrypto';
import { createStyledQrCode } from '../utils/qrUtils';
import LoadingSpinner from '../components/LoadingSpinner';

interface CredentialingProps {
  profile: StudentProfile;
  onComplete: () => void;
}

const Credentialing: React.FC<CredentialingProps> = ({ profile, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [credential, setCredential] = useState<StudentCredential | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { signData } = useWebCrypto();

  const cleanupStream = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => {
    const startCamera = async () => {
      if (stream) return;
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        // In a real app, you might use a placeholder image
      }
    };
    if (!photo) {
        startCamera();
    }
    return cleanupStream;
  }, [photo, stream, cleanupStream]);

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      cleanupStream();
    }
  };
  
  const generateCredential = async () => {
    if(!profile) return;
    setIsLoading(true);
    try {
        const issuedAt = new Date().toISOString();
        const dataToSign = { profile, photo, author: "RICHARD FELIPE URBINA", issuedAt };
        const signature = await signData(JSON.stringify(dataToSign));
        const qrPayload = JSON.stringify({ ...dataToSign, signature });
        const qrCodeUrl = await createStyledQrCode(qrPayload, { width: 300 });

        const newCredential: StudentCredential = { profile, qrCodeUrl, issuedAt };
        localStorage.setItem('STUDENT_CREDENTIAL', JSON.stringify(newCredential));
        setCredential(newCredential);
    } catch (error) {
        console.error("Failed to generate credential:", error);
        // Handle error state in UI
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-black/20">
      <h1 className="font-cinzel text-4xl text-yellow-300 mb-8">Biometric Credential</h1>
      
      {!photo && (
        <div className="flex flex-col items-center">
            <p className="mb-2 text-gray-300">Centre your face for the biometric portrait.</p>
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md border-4 border-yellow-400 rounded-lg mb-4 transform -scale-x-100"></video>
            <button onClick={takePhoto} disabled={!stream} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg text-lg font-cinzel hover:bg-yellow-300 transition-colors disabled:bg-gray-500">
                Capture Portrait
            </button>
        </div>
      )}

      {photo && !credential && !isLoading && (
        <div className="flex flex-col items-center animate-fade-in">
            <img src={photo} alt="Student" className="w-64 h-auto border-4 border-yellow-400 rounded-lg mb-4 transform -scale-x-100"/>
            <p className="text-lg mb-4">Portrait captured. Now, forge your credential.</p>
            <button onClick={generateCredential} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg text-lg font-cinzel hover:bg-green-400 transition-colors">
                Forge Eternal Credential
            </button>
        </div>
      )}
      
      {isLoading && <LoadingSpinner message="Forging your cosmic signature..." />}

      {credential && (
        <div className="flex flex-col items-center text-center p-8 parchment-bg animate-fade-in max-w-md">
            <h2 className="font-cinzel text-3xl font-bold">Conservatory Credential</h2>
            <div className="w-full h-px bg-black/20 my-4"></div>
            <div className="p-2 bg-white/50 rounded-lg inline-block border border-black/20" style={{backgroundImage: "url('https://i.imgur.com/8R0g3iB.png')", backgroundSize: 'cover'}}>
                <img src={credential.qrCodeUrl} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64"/>
            </div>
            <p className="mt-4 font-cinzel font-bold text-2xl">{profile.name}</p>
            <p className="font-cinzel text-lg">{profile.instrument} - {profile.level} Level</p>
            <button onClick={onComplete} className="mt-8 bg-yellow-600 text-white font-bold py-2 px-8 rounded-lg text-lg font-cinzel hover:bg-yellow-700 transition-colors border border-black/50">
                Continue to the Library
            </button>
        </div>
      )}
    </div>
  );
};

export default Credentialing;