import React, { useState, useEffect } from 'react';
import { DatabaseState, User, Notification } from './types';
import { INITIAL_DATA } from './data/initialData';
import { RoleSelector } from './components/RoleSelector';
import { LandingHero } from './components/LandingHero';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ParentDashboard } from './components/ParentDashboard';

// Firebase imports
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

const STORAGE_KEY = 'studytrack_saas_db';

export default function App() {
  const [dbState, setDbState] = useState<DatabaseState>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_DATA.users[0]); // Default to Guru
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false); // Start on Landing Hero
  const [isSeeded, setIsSeeded] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);

  // 1. Establish Firebase Anonymous Authentication and Session Storage sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Firebase secure session loaded with UID:", user.uid);
        setAuthReady(true);
      } else {
        signInAnonymously(auth)
          .then(() => {
            console.log("Firebase secure anonymous session established.");
          })
          .catch(err => {
            console.warn("Firebase Anonymous Auth was restricted. Proceeding safely with public cloud settings.", err);
            setAuthReady(true);
          });
      }
    });

    // Mirror current selected user to storage for session retention if desired
    try {
      const savedUser = localStorage.getItem('studytrack_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsDemoMode(true);
      }
    } catch (e) {
      console.warn("Could not load user session from storage", e);
    }

    return () => unsub();
  }, []);

  // 2. Validate connection and seed cloud database if empty
  useEffect(() => {
    if (!authReady) return;

    const seedDatabaseIfEmpty = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          console.log("Firestore database is empty. Injecting StudyyTrack core seed models...");
          const batch = writeBatch(db);

          INITIAL_DATA.users.forEach((item) => {
            batch.set(doc(db, 'users', item.id), item);
          });
          
          INITIAL_DATA.classes.forEach((item) => {
            batch.set(doc(db, 'classes', item.id), item);
          });

          INITIAL_DATA.tasks.forEach((item) => {
            batch.set(doc(db, 'tasks', item.id), item);
          });

          INITIAL_DATA.submissions.forEach((item) => {
            batch.set(doc(db, 'submissions', item.id), item);
          });

          INITIAL_DATA.attendance.forEach((item) => {
            batch.set(doc(db, 'attendance', item.id), item);
          });

          INITIAL_DATA.notifications.forEach((item) => {
            batch.set(doc(db, 'notifications', item.id), item);
          });

          await batch.commit();
          console.log("Seeding process succeeded successfully.");
        }
      } catch (err) {
        console.error("Seeding checks failed: ", err);
      } finally {
        setIsSeeded(true);
      }
    };

    seedDatabaseIfEmpty();
  }, [authReady]);

  // 3. Keep application state fully in-sync with Firestore database collections
  useEffect(() => {
    if (!authReady) return;

    const collections = ['users', 'classes', 'tasks', 'submissions', 'attendance', 'notifications'] as const;
    const unsubscribes: (() => void)[] = [];

    collections.forEach((colName) => {
      const q = query(collection(db, colName));
      const unsub = onSnapshot(q, (snapshot) => {
        setDbState(prev => {
          const updatedList = snapshot.docs.map(snapDoc => snapDoc.data() as any);
          return {
            ...prev,
            [colName]: updatedList
          };
        });
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, colName);
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [authReady]);

  // Update central state and write changes directly to central Firestore collections
  const handleUpdateDb = (updater: (prev: DatabaseState) => DatabaseState) => {
    setDbState(prev => {
      const next = updater(prev);
      
      // Async Syncing to Cloud Storage Firestore
      setTimeout(async () => {
        try {
          const collections = ['users', 'classes', 'tasks', 'submissions', 'attendance', 'notifications'] as const;
          
          for (const col of collections) {
            const nextList = next[col] || [];
            const prevList = prev[col] || [];

            // Add or overwrite documents
            for (const docObj of nextList) {
              const prevDoc = prevList.find(d => d.id === docObj.id);
              if (!prevDoc || JSON.stringify(prevDoc) !== JSON.stringify(docObj)) {
                await setDoc(doc(db, col, docObj.id), docObj);
              }
            }

            // Prune deleted documents
            for (const docObj of prevList) {
              const stillExists = nextList.some(d => d.id === docObj.id);
              if (!stillExists) {
                await deleteDoc(doc(db, col, docObj.id));
              }
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "sync");
        }
      }, 0);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Helper inside App to send notifications
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
    try {
      localStorage.setItem('studytrack_current_user', JSON.stringify(user));
    } catch (_) {}
    setIsDemoMode(true); // Enter customizable dashboard
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
          availableUsers={dbState.users}
          isDemoMode={isDemoMode}
          setIsDemoMode={(val) => {
            if (!val) {
              try {
                localStorage.removeItem('studytrack_current_user');
              } catch (_) {}
            }
            setIsDemoMode(val);
          }}
        />
      )}

      {/* Main routing depending on state */}
      <main className="flex-1">
        {!isDemoMode ? (
          <LandingHero
            availableUsers={dbState.users}
            db={dbState}
            onUpdateDb={handleUpdateDb}
            onSelectUser={(user) => {
              setCurrentUser(user);
              try {
                localStorage.setItem('studytrack_current_user', JSON.stringify(user));
              } catch (_) {}
              setIsDemoMode(true);
            }}
            onRegisterUser={(newUser: User) => {
              handleUpdateDb(prev => ({
                ...prev,
                users: [newUser, ...prev.users]
              }));
              setCurrentUser(newUser);
              try {
                localStorage.setItem('studytrack_current_user', JSON.stringify(newUser));
              } catch (_) {}
              setIsDemoMode(true);
            }}
            onEnterDemo={() => setIsDemoMode(true)}
          />
        ) : (
          <div>
            {currentUser.role === 'guru' && (
              <TeacherDashboard
                db={dbState}
                currentUser={currentUser}
                onUpdateDb={handleUpdateDb}
                sendNotification={sendNotification}
                onLogout={() => setIsDemoMode(false)}
              />
            )}

            {currentUser.role === 'siswa' && (
              <StudentDashboard
                db={dbState}
                currentUser={currentUser}
                onUpdateDb={handleUpdateDb}
                sendNotification={sendNotification}
                onLogout={() => setIsDemoMode(false)}
              />
            )}

            {currentUser.role === 'orangtua' && (
              <ParentDashboard
                db={dbState}
                currentUser={currentUser}
                onUpdateDb={handleUpdateDb}
                onLogout={() => setIsDemoMode(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
