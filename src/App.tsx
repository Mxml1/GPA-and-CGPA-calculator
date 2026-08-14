import { useState } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calculator } from './components/Calculator';
import { CGPACalculator } from './components/CGPACalculator';
import { Dashboard } from './pages/Dashboard';
import { useStore } from './store/useStore';
import { LogOut, LayoutDashboard, Calculator as CalcIcon } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const { user, loginMock, logoutMock } = useStore();
  const [activeTab, setActiveTab] = useState<'gpa' | 'cgpa'>('gpa');

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 flex flex-col transition-colors duration-200">
        {/* Navigation Bar */}
        <header className="border-b border-border/40 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
                <CalcIcon className="text-primary" size={24} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                UniGrade
              </h1>
            </Link>
            
            <nav className="flex space-x-4 items-center">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/40"></div>
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <div className="h-4 w-px bg-border/50 mx-2"></div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-right hidden md:block">
                      <p className="font-medium text-foreground leading-none">{user.name}</p>
                      {user.isPremium && <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Premium</span>}
                    </div>
                    <button 
                      onClick={logoutMock}
                      className="text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
                  <button 
                    onClick={loginMock}
                    className="text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-foreground/10"
                  >
                    Sign In to Save
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 mt-8">
                  <div className="inline-block mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    Free Forever
                  </div>
                  <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent">
                    Calculate Your Future
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                    A modern, highly customizable GPA and CGPA calculator for university students worldwide. No sign-up required to get started.
                  </p>
                  
                  <div className="flex justify-center">
                    <div className="bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-xl inline-flex shadow-lg relative z-20">
                      <button 
                        onClick={() => setActiveTab('gpa')}
                        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'gpa' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        GPA Calculator
                      </button>
                      <button 
                        onClick={() => setActiveTab('cgpa')}
                        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'cgpa' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        CGPA Calculator
                      </button>
                    </div>
                  </div>
                </div>
                
                {activeTab === 'gpa' ? <Calculator /> : <CGPACalculator />}
              </div>
            } />
            <Route path="/dashboard" element={
              user ? <Dashboard /> : <Navigate to="/" replace />
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
