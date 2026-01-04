
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface TourStep {
  targetId: string | null;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: null, // Center modal
    title: "Welcome to AskIEP",
    description: "Your comprehensive digital advocacy vault. Let's take a quick tour to help you get the most out of your new tools."
  },
  {
    targetId: 'dashboard-hero-analyze',
    title: "IEP AI Analyzer",
    description: "Upload your child's IEP documents here. Our AI will break down goals, accommodations, and flag potential compliance issues automatically.",
    position: 'bottom'
  },
  {
    targetId: 'dashboard-hero-lab',
    title: "Advocacy Lab",
    description: "Practice difficult conversations with our AI Coach. Simulate meeting scenarios to build confidence before the real IEP meeting.",
    position: 'bottom'
  },
  {
    targetId: 'nav-item-comms',
    title: "Contact Log",
    description: "Documentation is your strongest defense. Log every email, call, and hallway conversation here to create an undeniable paper trail.",
    position: 'right'
  },
  {
    targetId: 'dashboard-card-goals',
    title: "Goal Progress Tracking",
    description: "Don't rely on the school's word. Track qualitative and quantitative data points here to ensure your child is making meaningful progress.",
    position: 'top'
  },
  {
    targetId: 'nav-item-legal',
    title: "Legal Support",
    description: "Confused by IDEA or procedural safeguards? Get instant, plain-language answers to your legal questions here.",
    position: 'right'
  },
  {
    targetId: null,
    title: "You're Ready!",
    description: "You now have the power of data and AI on your side. Remember, you are your child's most important expert. Let's begin."
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];

  const updatePosition = useCallback(() => {
    if (step.targetId) {
      const element = document.getElementById(step.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null); // Fallback to center if element missing
      }
    } else {
      setTargetRect(null);
    }
  }, [step.targetId]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, currentStep, updatePosition]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const renderTooltip = () => {
    // Basic positioning logic
    let style: React.CSSProperties = {};
    let arrowClass = '';
    
    if (targetRect && step.targetId) {
      const PADDING = 16;
      const TOOLTIP_WIDTH = 320;
      
      switch (step.position) {
        case 'right':
          style = {
            top: targetRect.top + (targetRect.height / 2) - 100, // Approximate centering
            left: targetRect.right + PADDING,
          };
          break;
        case 'bottom':
          style = {
            top: targetRect.bottom + PADDING,
            left: targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2),
          };
          break;
        case 'top':
          style = {
            bottom: window.innerHeight - targetRect.top + PADDING,
            left: targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2),
          };
          break;
        default: // Center fallback logic handled below if rect is null
          break;
      }
    }

    const isCentered = !targetRect;

    return (
      <div 
        className={`fixed z-[60] bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300 ${isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
        style={!isCentered ? style : {}}
      >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-xl">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                    Step {currentStep + 1} / {TOUR_STEPS.length}
                </span>
            </div>
            <button onClick={onComplete} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-2">{step.title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
            {step.description}
        </p>

        <div className="flex justify-between items-center">
            <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'}`}
                    />
                ))}
            </div>
            <button 
                onClick={handleNext}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg active:scale-95"
            >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'} 
                {currentStep === TOUR_STEPS.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Background Overlay with "Hole" if target exists */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-all duration-500"
        style={targetRect ? {
           clipPath: `polygon(
             0% 0%, 
             0% 100%, 
             100% 100%, 
             100% 0%, 
             ${targetRect.left}px 0%, 
             ${targetRect.left}px ${targetRect.top}px, 
             ${targetRect.right}px ${targetRect.top}px, 
             ${targetRect.right}px ${targetRect.bottom}px, 
             ${targetRect.left}px ${targetRect.bottom}px, 
             ${targetRect.left}px 0%
           )`
        } : {}}
      />
      
      {/* Target Highlight Ring */}
      {targetRect && (
          <div 
            className="absolute border-4 border-indigo-500 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-pulse"
            style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
            }}
          />
      )}

      {renderTooltip()}
    </div>,
    document.body
  );
};

export default OnboardingTour;
