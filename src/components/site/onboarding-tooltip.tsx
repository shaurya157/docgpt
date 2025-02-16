import React, { useEffect, useState } from 'react';

interface OnboardingStep {
  content: string;
  title?: string;
}

interface OnboardingTooltipProps {
  isSidebarOpen: boolean;
  steps: OnboardingStep[];
  onComplete?: () => void;
}

const OnboardingTooltip = ({
  isSidebarOpen,
  steps,
  onComplete,
}: OnboardingTooltipProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({
    bottom: 0,
    left: 0,
    top: 0,
  });

  useEffect(() => {
    const calculateTooltipPosition = () => {
      // Base measurements
      const sidebarWidth = 280; // Fixed sidebar width
      const baseHeight = 800; // Base height for calculations
      const currentHeight = window.innerHeight;

      // Calculate scale factor but don't let it go below 1
      const scaleFactor = Math.max(currentHeight / baseHeight, 1);

      // Fixed bottom positions for each step (based on your original positions)
      const bottomPositions = {
        chat: 55,
        feature: 50,
        upload: 70,
      };

      switch (currentStep) {
        case 0: // Chats tooltip
          setTooltipPosition({
            bottom: 0,
            left: sidebarWidth * 1,
            top: bottomPositions.chat,
          });
          break;

        case 1: // Upload files tooltip
          setTooltipPosition({
            bottom: bottomPositions.upload,
            left: sidebarWidth * 1,
            top: 0,
          });
          break;

        case 2: // Feature request tooltip
          setTooltipPosition({
            bottom: bottomPositions.feature,
            left: sidebarWidth * 1,
            top: 0,
          });
          break;
      }
    };

    // Calculate initial position
    calculateTooltipPosition();

    // Recalculate on window resize
    window.addEventListener('resize', calculateTooltipPosition);

    return () => {
      window.removeEventListener('resize', calculateTooltipPosition);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible || !steps[currentStep] || !isSidebarOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className="absolute rounded-xl bg-black p-3 text-white shadow-xl"
        style={{
          bottom: tooltipPosition.bottom
            ? `${tooltipPosition.bottom}px`
            : 'auto',
          left: `${tooltipPosition.left}px`,
          maxWidth: '300px',
          pointerEvents: 'auto',
          top: tooltipPosition.top ? `${tooltipPosition.top}px` : 'auto',
          transform: 'translate(-16px, 16px)',
        }}
      >
        <div
          className="absolute size-0"
          style={{
            borderBottom: '8px solid transparent',
            borderRight: '8px solid black',
            borderTop: '8px solid transparent',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        <div className="mb-4 text-sm">
          {currentStep !== 0 && steps[currentStep].title && (
            <h2 className="mb-2 text-base font-semibold">
              {steps[currentStep].title}
            </h2>
          )}
          <p>{steps[currentStep].content}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            className="px-4 py-2 text-sm font-semibold text-white transition-colors"
            onClick={handleSkip}
          >
            Skip
          </button>
          <button
            className="rounded-full border border-white px-4 py-2 text-sm font-semibold text-white transition-colors"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;
