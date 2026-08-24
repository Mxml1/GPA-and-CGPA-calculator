import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GradeMapping = {
  grade: string;
  points: number;
  minMarks?: number;
  maxMarks?: number;
};

export type GradingScale = {
  id: string;
  name: string;
  type: 'grade' | 'marks';
  mappings: GradeMapping[];
};

export type Subject = {
  id: string;
  name: string;
  credits: number;
  grade?: string;
  marks?: number;
  points: number;
};

export type Semester = {
  id: string;
  name: string;
  scaleId: string;
  subjects: Subject[];
  gpa: number;
};

export type User = {
  uid: string;
  name: string;
  email: string;
  isPremium: boolean;
};

interface AppState {
  user: User | null;
  scales: GradingScale[];
  semesters: Semester[];
  
  loginMock: () => void;
  logoutMock: () => void;
  
  addScale: (scale: GradingScale) => void;
  updateScale: (id: string, scale: GradingScale) => void;
  deleteScale: (id: string) => void;
  
  addSemester: (semester: Semester) => void;
  updateSemester: (id: string, semester: Semester) => void;
  deleteSemester: (id: string) => void;
}


const exactMarksScale: GradingScale = {
  id: 'exact-marks',
  name: 'Exact Marks Scale (Pakistan/HEC)',
  type: 'marks',
  mappings: [
    { grade: 'A', minMarks: 85, maxMarks: 100, points: 4.0 },
    { grade: 'A', minMarks: 84, maxMarks: 84, points: 3.9 },
    { grade: 'A', minMarks: 83, maxMarks: 83, points: 3.8 },
    { grade: 'A', minMarks: 82, maxMarks: 82, points: 3.7 },
    { grade: 'A', minMarks: 81, maxMarks: 81, points: 3.6 },
    { grade: 'B', minMarks: 80, maxMarks: 80, points: 3.5 },
    { grade: 'B', minMarks: 79, maxMarks: 79, points: 3.4 },
    { grade: 'B', minMarks: 78, maxMarks: 78, points: 3.4 },
    { grade: 'B', minMarks: 77, maxMarks: 77, points: 3.3 },
    { grade: 'B', minMarks: 76, maxMarks: 76, points: 3.3 },
    { grade: 'B', minMarks: 75, maxMarks: 75, points: 3.2 },
    { grade: 'B', minMarks: 74, maxMarks: 74, points: 3.2 },
    { grade: 'B', minMarks: 73, maxMarks: 73, points: 3.1 },
    { grade: 'B', minMarks: 72, maxMarks: 72, points: 3.0 },
    { grade: 'C', minMarks: 71, maxMarks: 71, points: 2.9 },
    { grade: 'C', minMarks: 70, maxMarks: 70, points: 2.8 },
    { grade: 'C', minMarks: 69, maxMarks: 69, points: 2.7 },
    { grade: 'C', minMarks: 68, maxMarks: 68, points: 2.6 },
    { grade: 'C', minMarks: 67, maxMarks: 67, points: 2.5 },
    { grade: 'C', minMarks: 66, maxMarks: 66, points: 2.5 },
    { grade: 'C', minMarks: 65, maxMarks: 65, points: 2.4 },
    { grade: 'C', minMarks: 64, maxMarks: 64, points: 2.4 },
    { grade: 'C', minMarks: 63, maxMarks: 63, points: 2.3 },
    { grade: 'C', minMarks: 62, maxMarks: 62, points: 2.2 },
    { grade: 'C', minMarks: 61, maxMarks: 61, points: 2.1 },
    { grade: 'C', minMarks: 60, maxMarks: 60, points: 2.0 },
    { grade: 'D', minMarks: 59, maxMarks: 59, points: 1.9 },
    { grade: 'D', minMarks: 58, maxMarks: 58, points: 1.8 },
    { grade: 'D', minMarks: 57, maxMarks: 57, points: 1.7 },
    { grade: 'D', minMarks: 56, maxMarks: 56, points: 1.6 },
    { grade: 'D', minMarks: 55, maxMarks: 55, points: 1.5 },
    { grade: 'D', minMarks: 54, maxMarks: 54, points: 1.4 },
    { grade: 'D', minMarks: 53, maxMarks: 53, points: 1.3 },
    { grade: 'D', minMarks: 52, maxMarks: 52, points: 1.2 },
    { grade: 'D', minMarks: 51, maxMarks: 51, points: 1.1 },
    { grade: 'D', minMarks: 50, maxMarks: 50, points: 1.0 },
    { grade: 'F', minMarks: 0, maxMarks: 49, points: 0.0 }
  ]
};
const defaultScale: GradingScale = {
  id: 'default-4.0',
  name: 'Standard Grade Scale (A-F)',
  type: 'grade',
  mappings: [
    { grade: 'A', points: 4.0 },
    { grade: 'B', points: 3.0 },
    { grade: 'C', points: 2.0 },
    { grade: 'D', points: 1.0 },
    { grade: 'F', points: 0.0 },
  ]
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      scales: [defaultScale, exactMarksScale],
      semesters: [],
      
      loginMock: () => set({
        user: { uid: 'mock-123', name: 'Student', email: 'student@example.com', isPremium: true }
      }),
      logoutMock: () => set({ user: null }),
      
      addScale: (scale) => set((state) => ({ scales: [...state.scales, scale] })),
      updateScale: (id, updated) => set((state) => ({
        scales: state.scales.map(s => s.id === id ? updated : s)
      })),
      deleteScale: (id) => set((state) => ({
        scales: state.scales.filter(s => s.id !== id)
      })),
      
      addSemester: (semester) => set((state) => ({ semesters: [...state.semesters, semester] })),
      updateSemester: (id, updated) => set((state) => ({
        semesters: state.semesters.map(s => s.id === id ? updated : s)
      })),
      deleteSemester: (id) => set((state) => ({
        semesters: state.semesters.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'gpa-calculator-storage-v2',
    }
  )
);

// selectedScaleId
