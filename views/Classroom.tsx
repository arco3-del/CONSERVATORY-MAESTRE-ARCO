
import React from 'react';
import { StudentProfile } from '../types';
import SalonMozart from './classrooms/SalonMozart';
import SalonMariaCallas from './classrooms/SalonMariaCallas';
import GranSalonInstrumento from './classrooms/GranSalonInstrumento';

interface ClassroomProps {
    profile: StudentProfile;
    studyPlan: string;
    onComplete: () => void;
}

const Classroom: React.FC<ClassroomProps> = ({ profile, studyPlan, onComplete }) => {
    
    // In a real scenario, we'd have logic to move between modules.
    // For this simulation, we assume one "class" is taken, and then we move on.
    const handleClassFinish = () => {
        // Here you could save progress before calling onComplete
        console.log("Classroom session finished. Moving to the next step.");
        onComplete();
    };
    
    switch (profile.path) {
        case 'kinder':
            return <SalonMozart profile={profile} studyPlan={studyPlan} onComplete={handleClassFinish} />;
        case 'vocal':
            return <SalonMariaCallas profile={profile} studyPlan={studyPlan} onComplete={handleClassFinish} />;
        case 'instrumental':
        default:
            return <GranSalonInstrumento profile={profile} studyPlan={studyPlan} onComplete={handleClassFinish} />;
    }
};

export default Classroom;
