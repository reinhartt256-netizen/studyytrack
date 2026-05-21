import React, { useState, useEffect } from 'react';
import { DatabaseState, User, Notification } from './types';
import { INITIAL_DATA } from './data/initialData';
import { RoleSelector } from './components/RoleSelector';
import { LandingHero } from './components/LandingHero';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ParentDashboard } from './components/ParentDashboard';

const STORAGE_KEY = 'studytrack_saas_db';

export default function App() {
  const [db, setDb] = useState<DatabaseState>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_DATA.users[0]); // Default to Guru
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false); // Start on Landing Hero

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDb(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      }
    } catch (e) {
      console.warn("Could not read local storage, using initial mock seed.", e);
    }
  }, []);

  // Update central state and persistent storage
  const handleUpdateDb = (updater: (prev: DatabaseState) => DatabaseState) => {
    setDb(prev => {
      const next = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Helper inside App to send notification live
  const sendNotification = (
    userId: string, 
    title: string, 
    message: string, 
    type: 'task' | 'grade' | 'attendance' | 'announcement'
  ) => {
    const newNotif: Notification = {
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      type
    };

    handleUpdateDb(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
  };

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    setIsDemoMode(true); // Always enter into custom dashboard when selecting via role selector
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Background Decorative Mesh for Frosted Glass Theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-50/50">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-sky-400/25 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-300/15 blur-[110px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>

      {/* Role selector switches is visible when checking dashboards, or user can toggle it */}
      {isDemoMode && (
        <RoleSelector
          currentUser={currentUser}
          onUserChange={handleUserChange}
          availableUsers={db.users}
          isDemoMode={isDemoMode}
          setIsDemoMode={setIsDemoMode}
        />
      )}

      {/* Main routing depending on state */}
      <main className="flex-1">
        {!isDemoMode ? (
          <LandingHero
            availableUsers={db.users}
            onSelectUser={(user) => {
              setCurrentUser(user);
              setIsDemoMode(true);
            }}
            onRegisterUser={(newUser: User) => {
              handleUpdateDb(prev => ({
                ...prev,
                users: [newUser, ...prev.users]
              }));
              setCurrentUser(newUser);
              setIsDemoMode(true);
            }}
            onEnterDemo={() => setIsDemoMode(true)}
          />
        ) : (
          <div>
            {currentUser.role === 'guru' && (
              <TeacherDashboard
                db={db}
                currentUser={currentUser}
                onUpdateDb={handleUpdateDb}
                sendNotification={sendNotification}
              />
            )}

            {currentUser.role === 'siswa' && (
              <StudentDashboard
                db={db}
                currentUser={currentUser}
                onUpdateDb={handleUpdateDb}
                sendNotification={sendNotification}
              />
            )}

            {currentUser.role === 'orangtua' && (
              <ParentDashboard
                db={db}
                currentUser={currentUser}
                onUpdateDb={handleUpdateDb}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
