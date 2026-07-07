import { useState, useMemo } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Subject } from '../store/useStore';
import { calculateSubjectPoints, calculateGPA, getGPAColorClass } from '../utils/gpa';

export const Calculator = ({ initialScaleId }: { initialScaleId?: string }) => {
  const { scales, user, addSemester } = useStore();
  const [semesterName, setSemesterName] = useState('');

  const handleSave = () => {
    if (!user) {
      alert("Please sign in to save your semester.");
      return;
    }
    if (!semesterName) {
      alert("Please enter a name for this semester (e.g., 'Fall 2024').");
      return;
    }
    const currentGPA = calculateGPA(subjects);
    addSemester({
      id: crypto.randomUUID(),
      name: semesterName,
      scaleId: selectedScaleId,
      subjects: subjects.filter(s => s.name.trim() !== '' || (s.grade || s.marks !== undefined)),
      gpa: currentGPA
    });
    alert("Semester saved successfully! You can view it in your Dashboard.");
    setSemesterName('');
  };
  
  const [selectedScaleId, setSelectedScaleId] = useState(initialScaleId || scales[0].id);
  const activeScale = useMemo(() => scales.find(s => s.id === selectedScaleId) || scales[0], [scales, selectedScaleId]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: crypto.randomUUID(), name: '', credits: 3, grade: '', points: 0 },
    { id: crypto.randomUUID(), name: '', credits: 3, grade: '', points: 0 },
    { id: crypto.randomUUID(), name: '', credits: 3, grade: '', points: 0 },
  ]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { id: crypto.randomUUID(), name: '', credits: 3, grade: '', points: 0 }]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleSubjectChange = (id: string, field: keyof Subject, value: any) => {
    setSubjects(subjects.map(sub => {
      if (sub.id !== id) return sub;
      const updatedSub = { ...sub, [field]: value };
      
      // Re-calculate points for this subject
      updatedSub.points = calculateSubjectPoints(updatedSub, activeScale);
      return updatedSub;
    }));
  };

  const currentGPA = calculateGPA(subjects);
  const isResting = currentGPA === 0 && subjects.every(s => s.points === 0 && !s.grade && s.marks === undefined);

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden p-6 sm:p-8 mt-8 backdrop-blur-sm relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-2xl"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10">
        <h3 className="text-xl font-bold tracking-tight text-white mb-4 sm:mb-0">Semester Grades</h3>
        <select 
          className="bg-secondary text-secondary-foreground border border-border rounded-lg px-4 py-2 focus:ring-2 ring-primary outline-none text-sm appearance-none cursor-pointer hover:bg-secondary/80 transition-colors"
          value={selectedScaleId}
          onChange={(e) => setSelectedScaleId(e.target.value)}
        >
          {scales.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="grid grid-cols-12 gap-3 sm:gap-4 px-2 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-5">Course</div>
          <div className="col-span-3">Credits</div>
          <div className="col-span-3">{activeScale.type === 'grade' ? 'Grade' : 'Marks (%)'}</div>
          <div className="col-span-1"></div>
        </div>

        {subjects.map((sub, index) => (
          <div key={sub.id} className="grid grid-cols-12 gap-3 sm:gap-4 items-center group/row">
            <div className="col-span-5">
              <input 
                type="text" 
                placeholder={`Course ${index + 1}`}
                className="w-full bg-background border border-border/50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base text-white placeholder:text-muted-foreground"
                value={sub.name}
                onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <input 
                type="number" 
                min="0"
                step="0.5"
                className="w-full bg-background border border-border/50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base text-white"
                value={sub.credits}
                onChange={(e) => handleSubjectChange(sub.id, 'credits', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-3">
              {activeScale.type === 'grade' ? (
                <select
                  className="w-full bg-background border border-border/50 rounded-lg px-2 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none text-sm sm:text-base text-white"
                  value={sub.grade}
                  onChange={(e) => handleSubjectChange(sub.id, 'grade', e.target.value)}
                >
                  <option value="">-</option>
                  {activeScale.mappings.map(m => (
                    <option key={m.grade} value={m.grade}>{m.grade}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  className="w-full bg-background border border-border/50 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base text-white"
                  value={sub.marks || ''}
                  onChange={(e) => handleSubjectChange(sub.id, 'marks', parseFloat(e.target.value))}
                  placeholder="e.g. 85"
                />
              )}
            </div>
            <div className="col-span-1 flex justify-end">
              <button 
                onClick={() => handleRemoveSubject(sub.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all p-2 opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                title="Remove Subject"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleAddSubject}
        className="mt-6 flex items-center space-x-2 text-sm text-primary hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg font-medium transition-all duration-300 relative z-10 border border-primary/20"
      >
        <Plus size={16} /> <span>Add Another Course</span>
      </button>

      <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-end relative z-10 gap-6">
        <div className="w-full sm:w-auto flex-1 max-w-sm">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Save Semester</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Fall 2024"
              className="flex-1 bg-background border border-border/50 rounded-lg px-4 py-2 outline-none focus:border-primary transition-all text-white text-sm sm:text-base"
              value={semesterName}
              onChange={(e) => setSemesterName(e.target.value)}
            />
            <button 
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Save size={16} /> <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-end w-full sm:w-auto">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Semester GPA</div>
          <div className={`text-6xl font-black tracking-tighter drop-shadow-sm ${getGPAColorClass(currentGPA, isResting)}`}>
            {currentGPA.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
