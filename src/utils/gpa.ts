import type { Subject, GradingScale, Semester } from '../store/useStore';

export const calculateSubjectPoints = (subject: Partial<Subject>, scale: GradingScale): number => {
  if (scale.type === 'grade' && subject.grade) {
    const mapping = scale.mappings.find(m => m.grade.toLowerCase() === subject.grade?.toLowerCase());
    return mapping ? mapping.points : 0;
  } else if (scale.type === 'marks' && subject.marks !== undefined) {
    const mapping = scale.mappings.find(m => 
      m.minMarks !== undefined && 
      m.maxMarks !== undefined &&
      subject.marks! >= m.minMarks && 
      subject.marks! <= m.maxMarks
    );
    return mapping ? mapping.points : 0;
  }
  return 0;
};

export const calculateGPA = (subjects: Subject[]): number => {
  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach(sub => {
    // Only calculate if points are determined (i.e. not empty grade/marks)
    if (sub.credits > 0 && sub.points >= 0 && (sub.grade || sub.marks !== undefined)) {
      totalCredits += sub.credits;
      totalPoints += sub.points * sub.credits;
    }
  });

  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
};

export const calculateCGPA = (semesters: Semester[]): number => {
  let totalCredits = 0;
  let totalPoints = 0;

  semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      if (sub.credits > 0 && sub.points >= 0 && (sub.grade || sub.marks !== undefined)) {
        totalCredits += sub.credits;
        totalPoints += sub.points * sub.credits;
      }
    });
  });

  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
};

export const calculateTotalCredits = (semesters: Semester[]): number => {
  let totalCredits = 0;
  semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      if (sub.credits > 0 && (sub.grade || sub.marks !== undefined)) {
        totalCredits += sub.credits;
      }
    });
  });
  return totalCredits;
};

export const getGPAColorClass = (gpa: number, isResting: boolean) => {
  if (isResting) {
    return 'bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent';
  }
  if (gpa >= 3.5) {
    return 'bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent';
  } else if (gpa >= 3.0) {
    return 'bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent';
  } else if (gpa >= 2.0) {
    return 'bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent';
  } else {
    return 'bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent';
  }
};

export const getGPATextColorClass = (gpa: number, isResting: boolean) => {
  if (isResting) return 'text-white';
  if (gpa >= 3.5) return 'text-violet-400';
  if (gpa >= 3.0) return 'text-emerald-400';
  if (gpa >= 2.0) return 'text-amber-400';
  return 'text-rose-400';
};
