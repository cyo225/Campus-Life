import { useState, useEffect, useCallback } from 'react';
import { UserProfile, Course, Assignment, Exam, CampusAnnouncement, CampusLink, FoodMerchant, MerchantSubscription } from '../types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_COURSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_EXAMS,
  INITIAL_CAMPUS_LINKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_MERCHANTS,
} from '../constants/initialData';

const STORAGE_KEYS = {
  USER_PROFILE: 'campus_life_profile_v1',
  COURSES: 'campus_life_courses_v1',
  ASSIGNMENTS: 'campus_life_assignments_v1',
  EXAMS: 'campus_life_exams_v1',
  THEME: 'campus_life_theme_v1',
  MERCHANTS: 'campus_life_merchants_v1',
  SUBSCRIPTIONS: 'campus_life_subscriptions_v1',
};

export function useCampusData() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USER_PROFILE;
  });

  // Courses
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COURSES;
  });

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ASSIGNMENTS;
  });

  // Exams
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXAMS;
  });

  // Announcements & Links (Read-only reference with fresh fallback)
  const [campusLinks] = useState<CampusLink[]>(INITIAL_CAMPUS_LINKS);
  const [announcements] = useState<CampusAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  // Food Merchants & Subscriptions
  const [merchants] = useState<FoodMerchant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MERCHANTS;
  });

  const [subscriptions, setSubscriptions] = useState<MerchantSubscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const addSubscription = useCallback((data: Omit<MerchantSubscription, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: MerchantSubscription = {
      ...data,
      id: 'sub_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    setSubscriptions((prev) => {
      const updated = [newSub, ...prev];
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
      return updated;
    });
    return newSub;
  }, []);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Save profile
  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setProfile((prev) => {
      // Force school to always be '朝陽科技大學'
      const updated: UserProfile = { ...prev, ...newProfile, school: '朝陽科技大學' };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Save courses
  const saveCourses = useCallback((updated: Course[]) => {
    setCourses(updated);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  }, []);

  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: 'c_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    };
    setCourses((prev) => {
      const updated = [...prev, newCourse];
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      return updated;
    });
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Assignments Handlers
  const addAssignment = useCallback((item: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newItem: Assignment = {
      ...item,
      id: 'a_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      return updated;
    });
    return newItem;
  }, []);

  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleAssignmentComplete = useCallback((id: string) => {
    setAssignments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a));
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    setAssignments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Exams Handlers
  const addExam = useCallback((item: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...item,
      id: 'e_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    };
    setExams((prev) => {
      const updated = [...prev, newExam].sort(
        (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
      );
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(updated));
      return updated;
    });
    return newExam;
  }, []);

  const updateExam = useCallback((id: string, updates: Partial<Exam>) => {
    setExams((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Batch import handlers
  const importBatchCourses = useCallback((newCourses: Course[], replace: boolean) => {
    setCourses((prev) => {
      const updated = replace ? newCourses : [...prev, ...newCourses];
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const importBatchAssignments = useCallback((newItems: Omit<Assignment, 'id' | 'createdAt'>[]) => {
    setAssignments((prev) => {
      const prepared: Assignment[] = newItems.map((item, idx) => ({
        ...item,
        id: 'a_imp_' + Date.now().toString(36) + '_' + idx,
        createdAt: new Date().toISOString(),
      }));
      const updated = [...prepared, ...prev];
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const importBatchExams = useCallback((newItems: Omit<Exam, 'id'>[]) => {
    setExams((prev) => {
      const prepared: Exam[] = newItems.map((item, idx) => ({
        ...item,
        id: 'e_imp_' + Date.now().toString(36) + '_' + idx,
      }));
      const updated = [...prev, ...prepared].sort(
        (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
      );
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset to default demo data
  const resetToDemoData = useCallback(() => {
    setProfile(INITIAL_USER_PROFILE);
    setCourses(INITIAL_COURSES);
    setAssignments(INITIAL_ASSIGNMENTS);
    setExams(INITIAL_EXAMS);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  }, []);

  // Backup data export
  const exportDataJson = useCallback(() => {
    const backup = {
      app: 'CampusLife-CYUT',
      exportedAt: new Date().toISOString(),
      profile,
      courses,
      assignments,
      exams,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cyut_campus_life_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [profile, courses, assignments, exams]);

  // Import data
  const importDataJson = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.profile) setProfile({ ...data.profile, school: '朝陽科技大學' });
      if (Array.isArray(data.courses)) setCourses(data.courses);
      if (Array.isArray(data.assignments)) setAssignments(data.assignments);
      if (Array.isArray(data.exams)) setExams(data.exams);

      if (data.profile) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify({ ...data.profile, school: '朝陽科技大學' }));
      if (data.courses) localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(data.courses));
      if (data.assignments) localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
      if (data.exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: '檔案格式無效，請確認為正確的 JSON 備份檔' };
    }
  }, []);

  return {
    isDark,
    toggleTheme,
    profile,
    updateProfile,
    courses,
    saveCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    assignments,
    addAssignment,
    updateAssignment,
    toggleAssignmentComplete,
    deleteAssignment,
    exams,
    addExam,
    updateExam,
    deleteExam,
    campusLinks,
    announcements,
    merchants,
    subscriptions,
    addSubscription,
    importBatchCourses,
    importBatchAssignments,
    importBatchExams,
    resetToDemoData,
    exportDataJson,
    importDataJson,
  };
}
