import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateCGPA, calculateTotalCredits, getGPAColorClass, getGPABadgeClass } from '../utils/gpa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Download, TrendingUp, Settings, FileText, Pencil, Trash2 } from 'lucide-react';
import { exportToPDF } from '../utils/export';
import { ForecastingModal } from '../components/ForecastingModal';
import { trackEvent } from '../lib/analytics';

export const Dashboard = () => {
  const { user, semesters, deleteSemester } = useStore();
  const navigate = useNavigate();
  const [isForecastOpen, setIsForecastOpen] = useState(false);

  const handleEdit = (sem: any) => {
    window.localStorage.setItem('draft-subjects', JSON.stringify(sem.subjects));
    window.localStorage.setItem('draft-semester-name', JSON.stringify(sem.name));
    window.localStorage.setItem('draft-scale-id', JSON.stringify(sem.scaleId));
    window.localStorage.setItem('editing-semester-id', JSON.stringify(sem.id));
    trackEvent('semester_edit_started', {
      source: 'dashboard',
      course_count: sem.subjects.length,
    });
    navigate('/');
  };
  
  // Helper to parse semester chronological order (e.g. "Spring 2025" -> 20251)
  const parseSemesterOrder = (name: string) => {
    const clean = name.trim().toLowerCase();
    const yearMatch = clean.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
    
    let termOrder = 0;
    if (clean.includes('spring')) termOrder = 1;
    else if (clean.includes('summer')) termOrder = 2;
    else if (clean.includes('fall')) termOrder = 3;
    else if (clean.includes('winter')) termOrder = 4;
    
    return year * 10 + termOrder;
  };

  const sortedSemesters = [...semesters].sort((a, b) => parseSemesterOrder(a.name) - parseSemesterOrder(b.name));

  const currentCGPA = calculateCGPA(sortedSemesters);
  const totalCredits = calculateTotalCredits(sortedSemesters);
  
  // Format data for Recharts
  const chartData = sortedSemesters.map((sem, index) => {
    const semsUpToNow = sortedSemesters.slice(0, index + 1);
    return {
      name: sem.name,
      gpa: sem.gpa,
      cgpa: calculateCGPA(semsUpToNow)
    };
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back, {user?.name}</h2>
          <p className="text-muted-foreground">Track your academic progress and forecast your future.</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button 
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={() => {
              setIsForecastOpen(true);
              trackEvent('forecast_opened', { semester_count: semesters.length });
            }}
          >
            <TrendingUp size={16} /> <span>Forecast</span>
          </button>
          <button 
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={() => {
              exportToPDF(semesters, user!);
              trackEvent('pdf_exported', {
                source: 'dashboard',
                semester_count: semesters.length,
              });
            }}
          >
            <Download size={16} /> <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 ">
            <TrendingUp size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current CGPA</p>
          <p className={`text-5xl font-black ${getGPAColorClass(currentCGPA, sortedSemesters.length === 0)}`}>{currentCGPA.toFixed(2)}</p>
        </div>
        
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Credits</p>
          <p className="text-5xl font-black text-foreground">{totalCredits}</p>
        </div>

        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-center items-center cursor-pointer hover:bg-card/80 transition-colors border-dashed border-2">
          <Settings className="text-muted-foreground mb-3" size={32} />
          <p className="text-sm font-medium text-foreground">Manage Grading Scales</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-6">Performance Trend</h3>
        <div className="h-[300px] w-full">
          {semesters.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground)) "tickLine={false} axisLine={false}/>
                <YAxis domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="cgpa" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="CGPA"/>
                <Line type="monotone" dataKey="gpa" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Semester GPA"/>
                </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-black/20 rounded-xl border border-dashed border-border/30">
              <TrendingUp size={48} className="mb-4 opacity-20" />
              <p>No semesters added yet.</p>
              <p className="text-sm">Add a semester below to see your trend chart.</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">Semesters</h3>
          <Link to="/" className="flex items-center space-x-2 text-sm text-primary hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg font-medium transition-colors border border-primary/20 bg-primary/5">
            <Plus size={16} /> <span>Add Semester</span>
          </Link>
        </div>
        
        {semesters.length === 0 ? (
          <div className="bg-card/30 border border-border/30 border-dashed rounded-xl p-12 text-center">
             <p className="text-muted-foreground">You haven't saved any semesters yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedSemesters.map(sem => (
                <div
                  key={sem.id}
                  className="rounded-lg border border-border/70 bg-card p-3.5 shadow-sm transition-all hover:border-primary/50 dark:bg-secondary/90 dark:border-border dark:shadow-[0_0_0_1px_hsl(var(--border)),0_4px_12px_rgba(0,0,0,0.35)] dark:hover:border-primary/45 dark:hover:bg-secondary"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-semibold text-foreground text-base leading-snug">{sem.name}</h4>
                    <div className={`shrink-0 px-2 py-0.5 rounded-md font-bold text-xs border ${getGPABadgeClass(sem.gpa, false)}`}>
                      {sem.gpa.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-between mb-2.5">
                    <span>{sem.subjects.length} courses</span>
                    <span>{sem.subjects.reduce((sum, s) => sum + s.credits, 0)} credits</span>
                  </div>
                  
                  <div className="flex space-x-1.5 pt-2 border-t border-border/50 dark:border-border/80 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(sem);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Edit Semester"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this semester?")) {
                          deleteSemester(sem.id);
                          trackEvent('semester_deleted', {
                            source: 'dashboard',
                            course_count: sem.subjects.length,
                          });
                        }
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      title="Delete Semester"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      <ForecastingModal isOpen={isForecastOpen} onClose={() => setIsForecastOpen(false)} />
    </div>
  );
}
