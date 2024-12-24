import React, { useState } from "react";

interface TooltipPosition {
  bottom?: number | string;
  left: number | string;
}

interface OnboardingStep {
  title?: string;
  content: string;
  position: TooltipPosition;
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
          bottom: steps[currentStep].position.bottom,
          left: steps[currentStep].position.left,
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
