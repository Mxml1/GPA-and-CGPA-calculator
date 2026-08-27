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

export const getSemesterKey = (name: string): string => {
  const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
  const yearMatch = clean.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : '';

  let term = '';
  if (clean.includes('spring')) term = 'spring';
  else if (clean.includes('summer')) term = 'summer';
  else if (clean.includes('fall')) term = 'fall';
  else if (clean.includes('winter')) term = 'winter';

  if (term && year) return `${term}-${year}`;
  return clean;
};

export const isDuplicateSemesterName = (
  semesters: Semester[],
  name: string,
  excludeId?: string | null
): boolean => {
  const key = getSemesterKey(name);
  return semesters.some(
    (semester) => semester.id !== excludeId && getSemesterKey(semester.name) === key
  );
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
    return 'text-muted-foreground';
  }
  if (gpa >= 3.5) {
    return 'text-emerald-600 dark:text-emerald-400';
  } else if (gpa >= 3.0) {
    return 'text-blue-600 dark:text-blue-400';
  } else if (gpa >= 2.0) {
    return 'text-amber-400 dark:text-amber-500';
  } else {
    return 'text-red-600 dark:text-red-500';
  }
};

export const getGPATextColorClass = (gpa: number, isResting: boolean) => {
  if (isResting) {
    return 'text-muted-foreground';
  }
  if (gpa >= 3.5) {
    return 'text-emerald-600 dark:text-emerald-400';
  } else if (gpa >= 3.0) {
    return 'text-blue-600 dark:text-blue-400';
  } else if (gpa >= 2.0) {
    return 'text-lime-600 dark:text-lime-400';
  } else {
    return 'text-red-600 dark:text-red-400';
  }
};

export const getGPABadgeClass = (gpa: number, isResting: boolean) => {
  if (isResting) {
    return 'bg-muted text-muted-foreground border-border';
  }
  if (gpa >= 3.5) {
    return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  } else if (gpa >= 3.0) {
    return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
  } else if (gpa >= 2.0) {
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  } else {
    return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
  }
};
