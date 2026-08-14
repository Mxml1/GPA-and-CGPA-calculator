import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateCGPA, calculateTotalCredits, getGPAColorClass, getGPATextColorClass } from '../utils/gpa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Download, TrendingUp, Settings, FileText } from 'lucide-react';
import { exportToPDF } from '../utils/export';
import { ForecastingModal } from '../components/ForecastingModal';

export const Dashboard = () => {
  const { user, semesters } = useStore();
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  
  const currentCGPA = calculateCGPA(semesters);
  const totalCredits = calculateTotalCredits(semesters);
  
  // Format data for Recharts
  const chartData = semesters.map((sem, index) => {
    const semsUpToNow = semesters.slice(0, index + 1);
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
            onClick={() => setIsForecastOpen(true)}
          >
            <TrendingUp size={16} /> <span>Forecast</span>
          </button>
          <button 
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            onClick={() => exportToPDF(semesters, user!)}
          >
            <Download size={16} /> <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current CGPA</p>
          <p className={`text-5xl font-black ${getGPAColorClass(currentCGPA, semesters.length === 0)}`}>{currentCGPA.toFixed(2)}</p>
        </div>
        
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Credits</p>
          <p className="text-5xl font-black text-foreground">{totalCredits}</p>
        </div>

        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-center items-center cursor-pointer hover:bg-card/80 transition-colors border-dashed border-2">
          <Settings className="text-muted-foreground mb-3 group-hover:text-primary transition-colors" size={32} />
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Manage Grading Scales</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-6">Performance Trend</h3>
        <div className="h-[300px] w-full">
          {semesters.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#888" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="cgpa" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} name="CGPA" />
                <Line type="monotone" dataKey="gpa" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Semester GPA" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {semesters.map(sem => (
               <div key={sem.id} className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer shadow-md">
                 <div className="flex justify-between items-start mb-4">
                   <h4 className="font-bold text-foreground text-lg">{sem.name}</h4>
                   <div className={`bg-secondary px-2.5 py-1 rounded-md font-bold text-sm border border-border ${getGPATextColorClass(sem.gpa, false)}`}>
                     {sem.gpa.toFixed(2)}
                   </div>
                 </div>
                 <div className="text-sm text-muted-foreground flex items-center justify-between">
                   <span>{sem.subjects.length} courses</span>
                   <span>{sem.subjects.reduce((sum, s) => sum + s.credits, 0)} credits</span>
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
