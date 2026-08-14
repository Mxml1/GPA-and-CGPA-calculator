
import { Plus, Trash2, Download } from 'lucide-react';
import { getGPAColorClass } from '../utils/gpa';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { exportCGPAToPDF } from '../utils/export';
import { useStore } from '../store/useStore';

type SimpleSemester = {
  id: string;
  name: string;
  gpa: number | '';
  credits: number | '';
}

export const CGPACalculator = () => {
  const { user } = useStore();
  const [studentName, setStudentName] = useLocalStorage('draft-cgpa-student-name', '');
  const [semesters, setSemesters] = useLocalStorage<SimpleSemester[]>('draft-cgpa-semesters', [
    { id: crypto.randomUUID(), name: 'Previous Semesters (Combined)', gpa: '', credits: '' },
    { id: crypto.randomUUID(), name: 'Current Semester', gpa: '', credits: '' },
  ]);

  const handleAddSemester = () => {
    setSemesters([...semesters, { id: crypto.randomUUID(), name: '', gpa: '', credits: '' }]);
  };

  const handleRemoveSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const handleChange = (id: string, field: keyof SimpleSemester, value: string | number) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Calculate CGPA
  let totalPoints = 0;
  let totalCredits = 0;

  semesters.forEach(s => {
    const gpa = typeof s.gpa === 'number' ? s.gpa : 0;
    const credits = typeof s.credits === 'number' ? s.credits : 0;
    
    if (gpa >= 0 && credits > 0 && typeof s.gpa === 'number' && typeof s.credits === 'number') {
      totalPoints += (gpa * credits);
      totalCredits += credits;
    }
  });

  const finalCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  const isResting = totalCredits === 0;

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/5 dark:shadow-black/50 overflow-hidden p-6 sm:p-8 mt-8 backdrop-blur-sm relative group fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10">
        <h3 className="text-xl font-bold tracking-tight text-foreground mb-4 sm:mb-0">Calculate Cumulative GPA</h3>
        <p className="text-sm text-muted-foreground max-w-sm text-right">
          Enter your previous overall CGPA & Credits, followed by your new semester's GPA & Credits.
        </p>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 px-2 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Semester / Label</div>
          <div className="col-span-3">Credits</div>
          <div className="col-span-3">GPA</div>
          <div className="col-span-1"></div>
        </div>

        {semesters.map((sem, index) => (
          <div key={sem.id} className="grid grid-cols-12 gap-3 sm:gap-4 items-center group/row">
            <div className="col-span-5">
              <input 
                type="text" 
                placeholder={`Semester ${index + 1}`}
                className="w-full bg-background border border-border/50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base text-foreground placeholder:text-muted-foreground"
                value={sem.name}
                onChange={(e) => handleChange(sem.id, 'name', e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <input 
                type="number" 
                min="0"
                step="0.5"
                placeholder="e.g. 15"
                className="w-full bg-background border border-border/50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base text-foreground"
                value={sem.credits}
                onChange={(e) => handleChange(sem.id, 'credits', parseFloat(e.target.value) || '')}
              />
            </div>
            <div className="col-span-3">
              <input 
                type="number" 
                min="0"
                max="4.0"
                step="0.01"
                placeholder="e.g. 3.5"
                className="w-full bg-background border border-border/50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base text-foreground"
                value={sem.gpa}
                onChange={(e) => handleChange(sem.id, 'gpa', parseFloat(e.target.value) || '')}
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <button 
                onClick={() => handleRemoveSemester(sem.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all p-2 opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                title="Remove Row"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleAddSemester}
        className="mt-6 flex items-center space-x-2 text-sm text-primary hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg font-medium transition-all duration-300 relative z-10 border border-primary/20"
      >
        <Plus size={16} /> <span>Add Another Row</span>
      </button>

      <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-end relative z-10 gap-6">
        <div className="w-full sm:w-auto flex-1 max-w-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Student Name (PDF)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Max"
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-2 outline-none focus:border-primary transition-all text-foreground text-sm sm:text-base"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <button 
                onClick={() => {
                  exportCGPAToPDF(semesters, studentName || user?.name || 'Guest Student', finalCGPA, totalCredits);
                }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                title="Download CGPA Certificate PDF"
              >
                <Download size={16} /> <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end w-full sm:w-auto">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Overall CGPA</div>
          <div className={`text-6xl font-black tracking-tighter drop-shadow-sm ${getGPAColorClass(parseFloat(finalCGPA), isResting)}`}>
            {finalCGPA}
          </div>
        </div>
      </div>
    </div>
  );
}
