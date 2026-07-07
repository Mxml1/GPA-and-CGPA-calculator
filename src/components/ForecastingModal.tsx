import { useState } from 'react';
import { useStore } from '../store/useStore';
import { calculateTotalCredits, calculateCGPA } from '../utils/gpa';
import { X, Target } from 'lucide-react';

export const ForecastingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { semesters } = useStore();
  const currentCGPA = calculateCGPA(semesters);
  const totalCredits = calculateTotalCredits(semesters);
  
  const [targetCGPA, setTargetCGPA] = useState<number | ''>('');
  const [nextCredits, setNextCredits] = useState<number | ''>(15);
  
  if (!isOpen) return null;
  
  let requiredGPA: number | null = null;
  let message = '';
  
  if (targetCGPA !== '' && nextCredits !== '' && nextCredits > 0) {
    const currentPoints = currentCGPA * totalCredits;
    const totalTargetPoints = targetCGPA * (totalCredits + nextCredits);
    requiredGPA = (totalTargetPoints - currentPoints) / nextCredits;
    
    if (requiredGPA > 4.0) { // assuming 4.0 is max for the message context
      message = "This target might be impossible with standard grading.";
    } else if (requiredGPA < 0) {
      message = "You've already surpassed this goal!";
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 fade-in">
      <div className="bg-card border border-border/50 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary"></div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target size={20} className="text-primary" /> GPA Forecaster
            </h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4 bg-secondary/50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current CGPA</p>
                <p className="text-2xl font-bold text-white">{currentCGPA.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Credits</p>
                <p className="text-2xl font-bold text-white">{totalCredits}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Target CGPA</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g. 3.5"
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value) || '')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Future Credits</label>
              <input 
                type="number" 
                step="1"
                placeholder="e.g. 15"
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors text-white"
                value={nextCredits}
                onChange={(e) => setNextCredits(parseFloat(e.target.value) || '')}
              />
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 text-center mt-6">
            <p className="text-sm text-primary font-medium mb-1 uppercase tracking-wider">Required GPA</p>
            <div className="text-5xl font-black text-white flex items-center justify-center gap-3">
              {requiredGPA !== null ? requiredGPA.toFixed(2) : '-.--'}
            </div>
            {message && (
              <p className={`mt-3 text-sm ${requiredGPA !== null && requiredGPA > 4.0 ? 'text-destructive' : 'text-green-400'}`}>
                {message}
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
