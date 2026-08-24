
import type { CSSProperties } from 'react';
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
        <div className="hidden sm:grid grid-cols-12 gap-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-6">Semester / Label</div>
          <div className="col-span-2 text-center">Credits</div>
          <div className="col-span-3 text-center">GPA</div>
          <div className="col-span-1"></div>
        </div>

        {semesters.map((sem, index) => (
          <div
            key={sem.id}
            className="ug-entry-row group/row"
            style={{ '--row-index': index } as CSSProperties}
          >
            <div className="sm:col-span-6">
              <input 
                type="text" 
                placeholder={`Semester ${index + 1}`}
                className="ug-field"
                value={sem.name}
                onChange={(e) => handleChange(sem.id, 'name', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <input 
                type="number" 
                min="0"
                step="0.5"
                placeholder="15"
                className="ug-field ug-field-number"
                value={sem.credits}
                onChange={(e) => handleChange(sem.id, 'credits', parseFloat(e.target.value) || '')}
              />
            </div>
            <div className="sm:col-span-3">
              <input 
                type="number" 
                min="0"
                max="4.0"
                step="0.01"
                placeholder="3.50"
                className="ug-field ug-field-number"
                value={sem.gpa}
                onChange={(e) => handleChange(sem.id, 'gpa', parseFloat(e.target.value) || '')}
              />
            </div>
            <div className="sm:col-span-1 ug-row-action">
              <button 
                onClick={() => handleRemoveSemester(sem.id)}
                className="ug-icon-button"
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
        className="ug-soft-button mt-6 flex items-center space-x-2 text-sm text-primary hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg font-medium relative z-10 border border-primary/20"
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
                className="ug-field h-11"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <button 
                onClick={() => {
                  exportCGPAToPDF(semesters, studentName || user?.name || 'Guest Student', finalCGPA, totalCredits);
                }}
                className="ug-soft-button bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2"
                title="Download CGPA Certificate PDF"
              >
                <Download size={16} /> <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end w-full sm:w-auto">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Overall CGPA</div>
          <div key={finalCGPA} className={`ug-score-value text-6xl font-black tracking-tighter drop-shadow-sm ${getGPAColorClass(parseFloat(finalCGPA), isResting)}`}>
            {finalCGPA}
          </div>
        </div>
      </div>
    </div>
  );
}
