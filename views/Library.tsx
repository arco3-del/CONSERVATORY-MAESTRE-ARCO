import React, { useState } from 'react';
import { useWebCrypto } from '../hooks/useWebCrypto';
import LoadingSpinner from '../components/LoadingSpinner';
import { StudentProfile } from '../types';

declare const JSZip: any;
declare const saveAs: any;

interface LibraryProps {
  profile: StudentProfile;
  onComplete: () => void;
}

const ProfileModal: React.FC<{ profile: StudentProfile; onClose: () => void }> = ({ profile, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="parchment-bg p-8 rounded-lg max-w-md w-11/12" onClick={e => e.stopPropagation()}>
            <h2 className="font-cinzel text-3xl font-bold mb-4">Student Profile</h2>
            <p><strong className="font-cinzel">Name:</strong> {profile.name}</p>
            <p><strong className="font-cinzel">Age:</strong> {profile.age}</p>
            <p><strong className="font-cinzel">Instrument:</strong> {profile.instrument}</p>
            <p><strong className="font-cinzel">Level:</strong> {profile.level}</p>
            <p><strong className="font-cinzel">Goals:</strong> {profile.goals}</p>
            <button
                onClick={onClose}
                className="mt-6 w-full bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 transition-colors duration-300 font-cinzel"
            >
                Close
            </button>
        </div>
    </div>
);


const Library: React.FC<LibraryProps> = ({ profile, onComplete }) => {
  const { signData } = useWebCrypto();
  const [isLoadingDesktop, setIsLoadingDesktop] = useState(false);
  const [isLoadingMobile, setIsLoadingMobile] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const generateExtensionZip = async (platform: 'desktop' | 'mobile') => {
    platform === 'desktop' ? setIsLoadingDesktop(true) : setIsLoadingMobile(true);

    const manifest = {
      manifest_version: 3,
      name: "Tutor IA - Maestre Arco",
      version: "1.0.1",
      description: "Your personal AI professor from the Maestre Arco Conservatory.",
      author: "RICHARD FELIPE URBINA",
      action: {
        default_popup: "popup.html",
        default_icon: "icon128.png"
      },
      icons: {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
      },
      permissions: ["aiTextSession"],
      ...(platform === 'mobile' && { background: { service_worker: 'background.js' } })
    };

    const popupHtml = `
      <!DOCTYPE html><html><head><title>Tutor IA</title><style>
      body { font-family: 'Cinzel', serif; width: 300px; background-color: #0c0a1f; color: #f0f0f0; text-align: center; padding: 1rem; }
      img { width: 64px; height: 64px; margin-bottom: 1rem; }
      h2 { color: #D4AF37; margin: 0; }
      p { font-family: 'Lato', sans-serif; font-size: 0.9rem; }
      </style></head><body>
      <img src="icon128.png" alt="Maestre Arco Logo">
      <h2>Conservatory AI Tutor</h2>
      <p>A creation of:<br><strong>RICHARD FELIPE URBINA</strong></p>
      </body></html>
    `;
    
    const backgroundJs = `// Placeholder for Kiwi Browser background script functionality
    console.log("Maestre Arco AI Tutor - Background script loaded.");
    `;

    try {
      const iconResponse = await fetch('https://i.imgur.com/dO2bB6A.png');
      const iconBlob = await iconResponse.blob();

      const zip = new JSZip();
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("popup.html", popupHtml);
      if(platform === 'mobile') zip.file("background.js", backgroundJs);
      
      zip.file("icon16.png", iconBlob);
      zip.file("icon48.png", iconBlob);
      zip.file("icon128.png", iconBlob);
      
      const contentToSign = JSON.stringify(manifest) + popupHtml;
      const signature = await signData(contentToSign);
      zip.file("SIGNATURE.txt", `Verified content signed by the authority of Conservatorio Maestre Arco.\nSignature: ${signature}`);

      const finalBlob = await zip.generateAsync({ type: "blob" });
      const fileName = platform === 'desktop' 
        ? "Maestre-Arco-Tutor-Desktop.zip" 
        : "Maestre-Arco-Tutor-Kiwi.zip";
      saveAs(finalBlob, fileName);

    } catch (error) {
      console.error("Failed to generate ZIP:", error);
    } finally {
      platform === 'desktop' ? setIsLoadingDesktop(false) : setIsLoadingMobile(false);
    }
  };

  return (
    <>
      {isProfileVisible && <ProfileModal profile={profile} onClose={() => setIsProfileVisible(false)} />}
      <div className="min-h-screen w-screen flex flex-col items-center justify-center p-8">
        <h1 className="font-cinzel text-4xl md:text-5xl text-yellow-300 mb-4 text-center">Library of Extensions</h1>
        <p className="max-w-2xl text-center text-lg text-gray-300 mb-8">
          Here, you shall obtain your learning tools. Take your AI tutors with you.
        </p>
        <button onClick={() => setIsProfileVisible(true)} className="mb-8 text-cyan-400 underline hover:text-cyan-200 transition-colors">
            View my Profile
        </button>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Desktop Extension */}
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-lg border-2 border-yellow-400 shadow-2xl shadow-yellow-400/20 flex flex-col">
              {isLoadingDesktop ? (
                <LoadingSpinner message="Forging desktop tutor..." />
              ) : (
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div>
                    <h2 className="font-cinzel text-2xl text-yellow-200">Desktop</h2>
                    <p className="text-sm text-gray-400">(Chrome, Edge, etc.)</p>
                  </div>
                  <button
                    onClick={() => generateExtensionZip('desktop')}
                    className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 font-cinzel text-xl"
                  >
                    Download
                  </button>
                  <p className="text-xs text-gray-500 max-w-xs mt-4">
                    Instructions: Unzip the file. Go to <code className="bg-gray-700 p-1 rounded">chrome://extensions</code>, enable "Developer Mode" and click "Load unpacked".
                  </p>
                </div>
              )}
            </div>
            
            {/* Mobile Extension */}
            <div className="bg-black/30 backdrop-blur-md p-8 rounded-lg border-2 border-cyan-400 shadow-2xl shadow-cyan-400/20 flex flex-col">
              {isLoadingMobile ? (
                <LoadingSpinner message="Forging mobile tutor..." />
              ) : (
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div>
                    <h2 className="font-cinzel text-2xl text-cyan-200">Mobile</h2>
                    <p className="text-sm text-gray-400">(Kiwi Browser)</p>
                  </div>
                  <button
                    onClick={() => generateExtensionZip('mobile')}
                    className="bg-cyan-400 text-black font-bold py-3 px-8 rounded-lg hover:bg-cyan-300 transition-all duration-300 font-cinzel text-xl"
                  >
                    Download
                  </button>
                   <p className="text-xs text-gray-500 max-w-xs mt-4">
                    Instructions: In Kiwi, go to the menu (⋮), select "Extensions", enable "+ (from .zip)" and choose the downloaded file.
                  </p>
                </div>
              )}
            </div>
        </div>

        <button onClick={onComplete} className="mt-12 text-yellow-400 underline hover:text-yellow-200 transition-colors">
          Continue to the API Lab
        </button>
      </div>
    </>
  );
};

export default Library;