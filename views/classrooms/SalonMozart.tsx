
import React, { useRef, useEffect, useState } from 'react';
import { StudentProfile } from '../../types';
import { TEACHERS } from '../../constants';
import { useWebSpeech } from '../../hooks/useWebSpeech';

interface SalonMozartProps {
    profile: StudentProfile;
    studyPlan: string;
    onComplete: () => void;
}

interface Note {
  x: number;
  y: number;
  radius: number;
  speed: number;
  text: string;
}

const SalonMozart: React.FC<SalonMozartProps> = ({ profile, onComplete }) => {
  const teacher = TEACHERS.ESMERALDA;
  const { speak } = useWebSpeech();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const notesRef = useRef<Note[]>([]);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    speak(`Hello, little sunbeam ${profile.name}! Welcome to the Salon Mozart. I am Esmeralda Buena Vibra, and we're going to play with the musical notes!`, teacher.voice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, profile.name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const musicalNotes = ['🎵', '🎶', '🎼', '🎹', '🎸', '🎻', '🎷'];

    const gameLoop = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.02) {
        notesRef.current.push({
          x: Math.random() * canvas.width,
          y: -20,
          radius: 20,
          speed: 1 + Math.random() * 2,
          text: musicalNotes[Math.floor(Math.random() * musicalNotes.length)],
        });
      }

      notesRef.current.forEach((note, index) => {
        note.y += note.speed;
        context.font = '30px Arial';
        context.fillStyle = 'white';
        context.fillText(note.text, note.x, note.y);

        if (note.y > canvas.height + 20) {
          notesRef.current.splice(index, 1);
        }
      });

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    notesRef.current.forEach((note, index) => {
      const distance = Math.sqrt(Math.pow(note.x - x + 15, 2) + Math.pow(note.y - y, 2));
      if (distance < note.radius + 10) {
        notesRef.current.splice(index, 1);
        setScore(prev => prev + 1);
      }
    });
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 border-t-8 ${teacher.color} bg-gradient-to-br from-green-800/30 to-blue-800/30`}>
      <div className="text-center mb-6">
        <img src={teacher.image} alt={teacher.name} className={`w-40 h-40 object-cover rounded-full border-4 ${teacher.color} shadow-2xl mx-auto`} />
        <h1 className="font-cinzel text-4xl mt-4">{teacher.salon}</h1>
        <h2 className="text-xl text-gray-300">with {teacher.name}</h2>
      </div>
      
      <div className="w-full max-w-3xl aspect-video bg-sky-400/50 rounded-lg shadow-inner-lg overflow-hidden relative border-2 border-green-300">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full cursor-pointer"></canvas>
      </div>

      <div className="mt-6 bg-black/40 p-4 rounded-lg flex items-center space-x-4">
        <p className="font-cinzel text-2xl text-yellow-300">Score:</p>
        <div className="flex space-x-1">
            {Array.from({length: score}).map((_, i) => (
                <span key={i} className="text-2xl animate-pulse">❤️</span>
            ))}
        </div>
        <p className="font-bold text-2xl text-white">{score}</p>
      </div>

      <button onClick={onComplete} className="mt-8 bg-green-500 text-white font-bold py-2 px-8 rounded-lg hover:bg-green-400 transition-all duration-300 font-cinzel text-lg">
        Finish Lesson
      </button>
    </div>
  );
};

export default SalonMozart;