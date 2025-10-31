
import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, StudentProfile, StudentCredential } from './types';
import Entrance from './views/Entrance';
import Lobby from './views/Lobby';
import Diagnosis from './views/Diagnosis';
import Credentialing from './views/Credentialing';
import Library from './views/Library';
import ApiLab from './views/ApiLab';
import GrandHall from './views/GrandHall';
import Classroom from './views/Classroom';
import LiveTutor from './views/LiveTutor';
import Diploma from './views/Diploma';
import JudgesEntrance from './views/JudgesEntrance';
import ProgressBar from './components/ProgressBar';
import { useWebSpeech } from './hooks/useWebSpeech';

const SpeechController: React.FC = () => {
  const { isSpeaking, isPaused, pause, resume, cancel } = useWebSpeech();

  if (!isSpeaking) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full flex items-center space-x-2 z-50 border border-yellow-500 shadow-lg">
      {!isPaused ? (
        <button onClick={pause} title="Pause" className="text-yellow-300 hover:text-white transition-colors p-2 rounded-full">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg>
        </button>
      ) : (
        <button onClick={resume} title="Resume" className="text-yellow-300 hover:text-white transition-colors p-2 rounded-full">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
        </button>
      )}
      <button onClick={cancel} title="Stop" className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full">
         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 00-1 1v.01L7 10a1 1 0 001 1h4a1 1 0 001-1v-.01L13 10a1 1 0 00-1-1H8z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.ENTRANCE);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedCredentialStr = localStorage.getItem('STUDENT_CREDENTIAL');
      if (savedCredentialStr) {
        const savedCredential = JSON.parse(savedCredentialStr) as StudentCredential;
        setProfile(savedCredential.profile);
        // If a student is recognized, they can skip the initial steps
        setStep(AppStep.LIBRARY);
      }
    } catch (error) {
      console.error("Error loading credential from localStorage:", error);
      localStorage.removeItem('STUDENT_CREDENTIAL');
    }
  }, []);

  const stepNames = ['Entrance', 'Lobby', 'Diagnosis', 'Credential', 'Library', 'API Lab', 'Curriculum', 'Classroom', 'Live Tutor', 'Diploma'];
  const stepMapping: { [key in AppStep]: number } = {
    [AppStep.ENTRANCE]: 0,
    [AppStep.LOBBY]: 1,
    [AppStep.DIAGNOSIS]: 2,
    [AppStep.CREDENTIALING]: 3,
    [AppStep.LIBRARY]: 4,
    [AppStep.API_LAB]: 5,
    [AppStep.GRAND_HALL]: 6,
    [AppStep.CLASSROOM]: 7,
    [AppStep.LIVE_TUTOR]: 8,
    [AppStep.DIPLOMA]: 9,
    [AppStep.JUDGES_ENTRANCE]: -1, // No progress step for judges
  };

  const renderStep = useCallback(() => {
    switch (step) {
      case AppStep.ENTRANCE:
        return <Entrance onEnter={() => setStep(AppStep.LOBBY)} onJudgesEnter={() => setStep(AppStep.JUDGES_ENTRANCE)} />;
      case AppStep.LOBBY:
        return <Lobby onDiagnose={() => setStep(AppStep.DIAGNOSIS)} />;
      case AppStep.DIAGNOSIS:
        return (
          <Diagnosis
            onComplete={(p) => {
              setProfile(p);
              setStep(AppStep.CREDENTIALING);
            }}
          />
        );
      case AppStep.CREDENTIALING:
        return profile ? (
          <Credentialing
            profile={profile}
            onComplete={() => setStep(AppStep.LIBRARY)}
          />
        ) : null; // Should not happen if logic is correct
      case AppStep.LIBRARY:
        return profile ? (
           <Library profile={profile} onComplete={() => setStep(AppStep.API_LAB)} />
        ) : null;
      case AppStep.API_LAB:
        return <ApiLab onComplete={() => setStep(AppStep.GRAND_HALL)} />;
       case AppStep.GRAND_HALL:
        return profile ? (
          <GrandHall 
            profile={profile}
            onPlanGenerated={(p) => {
              setPlan(p);
              setStep(AppStep.CLASSROOM);
            }}
            onLiveTutor={() => setStep(AppStep.LIVE_TUTOR)}
          />
        ) : null;
      case AppStep.CLASSROOM:
        return profile && plan ? (
            <Classroom profile={profile} studyPlan={plan} onComplete={() => setStep(AppStep.LIVE_TUTOR)} />
        ) : null;
       case AppStep.LIVE_TUTOR:
        return <LiveTutor onComplete={() => setStep(AppStep.DIPLOMA)} />;
      case AppStep.DIPLOMA:
        return profile ? (
          <Diploma profile={profile} />
        ) : null;
      case AppStep.JUDGES_ENTRANCE:
        return <JudgesEntrance onExit={() => setStep(AppStep.ENTRANCE)} />;
      default:
        // Fallback to the beginning if the state is invalid
        return <Entrance onEnter={() => setStep(AppStep.LOBBY)} onJudgesEnter={() => setStep(AppStep.JUDGES_ENTRANCE)} />;
    }
  }, [step, profile, plan]);
  
  const currentStepIndex = stepMapping[step] ?? 0;
  const isCeremony = step === AppStep.ENTRANCE || step === AppStep.DIPLOMA || step === AppStep.JUDGES_ENTRANCE;

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0c0a1f] to-[#1d1a3e] text-white overflow-y-auto">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      <div className="relative z-10">
        {!isCeremony && <ProgressBar currentStep={currentStepIndex} steps={stepNames} />}
        {renderStep()}
        <SpeechController />
      </div>
    </main>
  );
};

export default App;