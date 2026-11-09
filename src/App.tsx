import React, { useState, useMemo, useEffect } from 'react';
import { TabKey, Assignment, Exam, AISolution, AIExamDigest } from './types';
import { useCampusData } from './hooks/useCampusData';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProfileModal } from './components/ProfileModal';
import { AIHomeworkSolverModal } from './components/AIHomeworkSolverModal';
import { AIExamDigestModal } from './components/AIExamDigestModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { HomeDashboard } from './components/tabs/HomeDashboard';
import { ScheduleView } from './components/tabs/ScheduleView';
import { TodoView } from './components/tabs/TodoView';
import { FoodDealsView } from './components/tabs/FoodDealsView';
import {
  getStoredNotifications,
  runScheduledCheck,
} from './services/notificationService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // AI Assistant Modals state
  const [isSolverModalOpen, setIsSolverModalOpen] = useState(false);
  const [targetAssignmentForSolver, setTargetAssignmentForSolver] = useState<Assignment | null>(null);

  const [isDigestModalOpen, setIsDigestModalOpen] = useState(false);
  const [targetExamForDigest, setTargetExamForDigest] = useState<Exam | null>(null);

  // Notification Center state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const {
    isDark,
    toggleTheme,
    profile,
    updateProfile,
    courses,
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
    merchants,
    subscriptions,
    addSubscription,
    importBatchCourses,
    importBatchAssignments,
    importBatchExams,
    resetToDemoData,
    exportDataJson,
    importDataJson,
  } = useCampusData();

  // Tab Title helper for header
  const tabTitles: Record<TabKey, string> = {
    home: '校園儀表板',
    schedule: '朝陽週課表',
    todo: '待辦作業與考試',
    food: '美食優惠與特約',
  };

  // Badge calculations
  const pendingAssignmentsCount = useMemo(() => {
    return assignments.filter((a) => !a.completed).length;
  }, [assignments]);

  const upcomingExamsCount = useMemo(() => {
    const now = new Date().getTime();
    return exams.filter((e) => new Date(e.examDate).getTime() > now).length;
  }, [exams]);

  // Refresh unread notifications count
  const refreshUnreadCount = () => {
    const list = getStoredNotifications();
    const unread = list.filter((n) => !n.read).length;
    setUnreadNotifCount(unread);
  };

  // Scheduled Notification Engine: check every 30s
  useEffect(() => {
    refreshUnreadCount();
    // Run initial scheduled check
    runScheduledCheck(assignments, exams);

    const interval = setInterval(() => {
      runScheduledCheck(assignments, exams);
      refreshUnreadCount();
    }, 30000);

    const handleNotifAdded = () => {
      refreshUnreadCount();
    };

    window.addEventListener('campus_life_notification_added', handleNotifAdded);

    return () => {
      clearInterval(interval);
      window.removeEventListener('campus_life_notification_added', handleNotifAdded);
    };
  }, [assignments, exams]);

  // AI Modal launchers
  const handleOpenAISolver = (assignment?: Assignment) => {
    setTargetAssignmentForSolver(assignment || null);
    setIsSolverModalOpen(true);
  };

  const handleOpenAIDigest = (exam?: Exam) => {
    setTargetExamForDigest(exam || null);
    setIsDigestModalOpen(true);
  };

  const handleSaveAISolution = (assignmentId: string, solution: AISolution) => {
    updateAssignment(assignmentId, { aiSolution: solution });
  };

  const handleSaveAIDigest = (examId: string, digest: AIExamDigest) => {
    updateExam(examId, { aiDigest: digest });
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#121212] text-neutral-800 dark:text-neutral-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* Offline Alert Floating Indicator */}
      <OfflineIndicator />

      {/* Top Application Header */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeTabTitle={tabTitles[activeTab]}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        unreadNotifCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
      />

      {/* Main Content Area (Mobile Viewport Frame) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3.5 pb-20">
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            courses={courses}
            assignments={assignments}
            exams={exams}
            onNavigateTab={setActiveTab}
            onToggleAssignment={toggleAssignmentComplete}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            courses={courses}
            onAddCourse={addCourse}
            onUpdateCourse={updateCourse}
            onDeleteCourse={deleteCourse}
            onImportCourses={importBatchCourses}
            onImportAssignments={importBatchAssignments}
            onImportExams={importBatchExams}
          />
        )}

        {activeTab === 'todo' && (
          <TodoView
            assignments={assignments}
            exams={exams}
            courses={courses}
            onAddAssignment={addAssignment}
            onUpdateAssignment={updateAssignment}
            onToggleAssignment={toggleAssignmentComplete}
            onDeleteAssignment={deleteAssignment}
            onAddExam={addExam}
            onUpdateExam={updateExam}
            onDeleteExam={deleteExam}
            onOpenAISolver={handleOpenAISolver}
            onOpenAIDigest={handleOpenAIDigest}
          />
        )}

        {activeTab === 'food' && (
          <FoodDealsView
            profile={profile}
            merchants={merchants}
            subscriptions={subscriptions}
            onAddSubscription={addSubscription}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation (4 Core Tabs) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingAssignmentsCount={pendingAssignmentsCount}
        upcomingExamsCount={upcomingExamsCount}
      />

      {/* Global Profile & Academic Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        onResetDemo={resetToDemoData}
        onExportData={exportDataJson}
        onImportData={importDataJson}
      />

      {/* AI Homework Solver Modal */}
      <AIHomeworkSolverModal
        isOpen={isSolverModalOpen}
        onClose={() => setIsSolverModalOpen(false)}
        targetAssignment={targetAssignmentForSolver}
        courses={courses}
        assignments={assignments}
        onSaveSolution={handleSaveAISolution}
      />

      {/* AI Exam Digest 3-in-1 Modal */}
      <AIExamDigestModal
        isOpen={isDigestModalOpen}
        onClose={() => setIsDigestModalOpen(false)}
        targetExam={targetExamForDigest}
        exams={exams}
        onSaveDigest={handleSaveAIDigest}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        assignments={assignments}
        exams={exams}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsNotifModalOpen(false);
        }}
        onNotificationUpdate={refreshUnreadCount}
      />
    </div>
  );
}
