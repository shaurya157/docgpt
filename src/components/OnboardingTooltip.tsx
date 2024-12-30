import React, { useState, useEffect } from "react";

interface OnboardingStep {
  title?: string;
  content: string;
}

interface OnboardingTooltipProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  isSidebarOpen: boolean;
}

const OnboardingTooltip = ({
  steps,
  onComplete,
  isSidebarOpen,
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
        upload: 70,
        feature: 50,
      };

      switch (currentStep) {
        case 0: // Chats tooltip
          setTooltipPosition({
            top: bottomPositions.chat,
            bottom: 0,
            left: sidebarWidth * 1,
          });
          break;

        case 1: // Upload files tooltip
          setTooltipPosition({
            top: 0,
            bottom: bottomPositions.upload,
            left: sidebarWidth * 1,
          });
          break;

        case 2: // Feature request tooltip
          setTooltipPosition({
            top: 0,
            bottom: bottomPositions.feature,
            left: sidebarWidth * 1,
          });
          break;
      }
    };

    // Calculate initial position
    calculateTooltipPosition();

    // Recalculate on window resize
    window.addEventListener("resize", calculateTooltipPosition);

    return () => {
      window.removeEventListener("resize", calculateTooltipPosition);
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
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute bg-black text-white p-3 rounded-xl shadow-xl"
        style={{
          bottom: tooltipPosition.bottom
            ? `${tooltipPosition.bottom}px`
            : "auto",
          top: tooltipPosition.top ? `${tooltipPosition.top}px` : "auto",
          left: `${tooltipPosition.left}px`,
          transform: "translate(-16px, 16px)",
          maxWidth: "300px",
          pointerEvents: "auto",
        }}
      >
        <div
          className="absolute w-0 h-0"
          style={{
            left: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid black",
          }}
        />

        <div className="mb-4 text-sm">
          {currentStep !== 0 && steps[currentStep].title && (
            <h2 className="font-semibold mb-2 text-base">
              {steps[currentStep].title}
            </h2>
          )}
          <p>{steps[currentStep].content}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleSkip}
            className="py-2 px-4 font-semibold text-sm text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="py-2 px-4 font-semibold rounded-full text-sm border border-white text-white transition-colors"
          >
            {currentStep === steps.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;
