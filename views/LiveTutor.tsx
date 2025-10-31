import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { TEACHERS } from '../constants';
import { Teacher, TranscriptionEntry } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

// Constants for audio processing
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;

const LiveTutor: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [selectedTutorId, setSelectedTutorId] = useState<string>('ARCO');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Select a tutor to begin.');
  const [error, setError] = useState<string | null>(null);
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const selectedTutor = TEACHERS[selectedTutorId];

  const cleanup = useCallback(() => {
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    scriptProcessorRef.current?.disconnect();
    microphoneStreamRef.current?.getTracks().forEach(track => track.stop());
    outputSourcesRef.current.forEach(source => source.stop());
    
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    scriptProcessorRef.current = null;
    microphoneStreamRef.current = null;
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    setIsConnected(false);
    setIsConnecting(false);
    setStatus('Session ended. You may begin again.');
  }, []);

  const handleDisconnect = async () => {
    if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
        sessionPromiseRef.current = null;
    }
    cleanup();
  };
  
  const handleConnect = async () => {
    if (!process.env.API_KEY) {
      const msg = "Error: API Key not configured.";
      setStatus(msg);
      setError(msg);
      return;
    }
    
    setError(null);
    setIsConnecting(true);
    setStatus(`Connecting with ${selectedTutor.name}...`);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedTutor.liveVoice } } },
          systemInstruction: selectedTutor.systemInstruction,
        },
        callbacks: {
          onopen: async () => {
            setIsConnecting(false);
            setIsConnected(true);
            setStatus(`Connected. Speak now.`);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(BUFFER_SIZE, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                   session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                setStatus(`${selectedTutor.name} is responding...`);
            }
            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscriptionRef.current.trim();
                const fullOutput = currentOutputTranscriptionRef.current.trim();
                
                setTranscriptionHistory(prev => [
                    ...prev,
                    ...(fullInput ? [{ speaker: 'user', text: fullInput }] : []),
                    ...(fullOutput ? [{ speaker: 'tutor', text: fullOutput }] : []),
                ]);
                
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
                setStatus('Turn complete. You may speak.');
            }
            
            // Handle audio output
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (audioData) {
                const audioContext = outputAudioContextRef.current!;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);

                const audioBuffer = await decodeAudioData(decode(audioData), audioContext, OUTPUT_SAMPLE_RATE, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);

                source.addEventListener('ended', () => {
                    outputSourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                outputSourcesRef.current.add(source);
            }
            
            // Handle interruptions
            if (message.serverContent?.interrupted) {
                outputSourcesRef.current.forEach(source => source.stop());
                outputSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Session Error:", e);
            const errorMessage = 'Connection error. Please try again.';
            setStatus(errorMessage);
            setError(errorMessage);
            cleanup();
          },
          onclose: (e: CloseEvent) => {
            cleanup();
          },
        }
      });
    } catch (error) {
      console.error("Connection failed:", error);
      const errorMessage = 'Could not initiate the session.';
      setStatus(errorMessage);
      setError(errorMessage);
      cleanup();
    }
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
        if(sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
        }
        cleanup();
    };
  }, [cleanup]);

  const TutorCard: React.FC<{tutor: Teacher}> = ({tutor}) => (
    <div 
        onClick={() => !isConnected && !isConnecting && setSelectedTutorId(tutor.id)}
        className={`p-4 rounded-lg border-4 transition-all duration-300 cursor-pointer ${selectedTutorId === tutor.id ? tutor.color + ' scale-105 shadow-lg' : 'border-gray-700 hover:border-gray-500'}`}
    >
        <img src={tutor.image} alt={tutor.name} className="w-24 h-24 object-cover rounded-full mx-auto mb-2" />
        <h3 className="font-cinzel text-center text-lg">{tutor.name}</h3>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="font-cinzel text-4xl text-yellow-300 mb-2">Live Tutor</h1>
      <p className="text-gray-400 mb-6">Speak directly with one of the Maestres.</p>

      {!isConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.values(TEACHERS).map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)}
        </div>
      )}

      <div className="w-full max-w-2xl bg-black/30 backdrop-blur-sm rounded-lg border-2 p-4" style={{borderColor: selectedTutor.color.replace('border-', '#')}}>
        {error && (
          <div className="bg-red-900/80 border border-red-600 text-red-200 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold font-cinzel">Cosmic Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
            <p className={`font-semibold ${isConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'}`}>{status}</p>
            <button
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={isConnecting}
                className={`px-6 py-2 rounded-lg font-cinzel font-bold transition-colors ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-500`}
            >
                {isConnecting ? 'Connecting...' : (isConnected ? 'End Session' : 'Begin Conversation')}
            </button>
        </div>
        
        <div className="h-80 bg-gray-900/50 rounded p-3 overflow-y-auto">
            {isConnecting && <div className="h-full flex items-center justify-center"><LoadingSpinner message="Initiating neural connection..." /></div>}
            {transcriptionHistory.length === 0 && !isConnecting && <p className="text-gray-500 text-center mt-8">The conversation history will appear here.</p>}
            {transcriptionHistory.map((entry, index) => (
                <div key={index} className={`mb-3 ${entry.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block p-2 rounded-lg max-w-md ${entry.speaker === 'user' ? 'bg-yellow-800' : 'bg-gray-700'}`}>
                       <span className="font-bold capitalize">{entry.speaker === 'user' ? 'You' : selectedTutor.name}: </span>{entry.text}
                    </span>
                </div>
            ))}
        </div>
      </div>
      <button onClick={onComplete} className="mt-8 text-yellow-400 underline hover:text-yellow-200 transition-colors">
          I have finished, I wish for my diploma.
      </button>
    </div>
  );
};

export default LiveTutor;