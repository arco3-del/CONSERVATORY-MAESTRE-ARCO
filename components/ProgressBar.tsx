import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full px-4 md:px-10 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center w-20">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${isCompleted ? 'bg-yellow-400 border-yellow-400' : ''}
                    ${isCurrent ? 'border-yellow-300 scale-110 animate-pulse' : 'border-gray-500'}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isCurrent ? 'bg-yellow-300' : 'bg-gray-500'}`}></div>
                  )}
                </div>
                <p className={`mt-2 text-xs md:text-sm font-cinzel transition-colors duration-500 ${isCurrent || isCompleted ? 'text-yellow-300' : 'text-gray-500'}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded
                  ${isCompleted ? 'bg-yellow-400' : 'bg-gray-600'}
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
