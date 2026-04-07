
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  geniusMode: boolean;
  setGeniusMode: (mode: boolean) => void;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const geniusMode = profile?.geniusMode ?? true;

  const setGeniusMode = async (mode: boolean) => {
    if (!user) return;
    await updateProfileData({ geniusMode: mode });
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // PRIORITY BYPASS: Demo Mode
    if (email === 'demo@thinkflow.ai' && password === 'demo123456') {
      console.log('Entering Demo Genius Mode...');
      const mockUser = {
        uid: 'demo-uid-123',
        email: 'demo@thinkflow.ai',
        displayName: 'Demo Genius'
      } as unknown as User;
      
      setUser(mockUser);
      setProfile({
        uid: 'demo-uid-123',
        name: 'Demo Genius',
        email: 'demo@thinkflow.ai',
        age: 15,
        studentClass: '9B',
        interests: ['AI', 'Physics', 'Gaming'],
        xp: 1250,
        level: 12,
        role: 'student',
        language: 'en',
        theme: 'dark',
        bio: 'Exploring the ThinkFlow universe in Genius Mode.'
      });
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName: name });
      
      const profileData: UserProfile = {
        uid: newUser.uid,
        email,
        name,
        age: 15,
        studentClass: '9A',
        interests: [],
        xp: 0,
        level: 1,
        role: 'student',
        language: 'en',
        theme: 'light',
        bio: '',
        geniusMode: true,
        learningDepth: 'Deep',
        explanationStyle: 'Metaphorical'
      };
      
      await setDoc(doc(db, 'users', newUser.uid), profileData);
    } catch (error) {
      console.error("Sign-Up Error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      // For this demo, we'll just mark it as deleted in the profile
      await setDoc(doc(db, 'users', user.uid), { bio: (profile?.bio || '') + ' [DELETED]' }, { merge: true });
      await signOut();
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.uid !== 'demo-uid-123') {
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Profile doesn't exist, create a fallback
          const newUser: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || 'New User',
            age: 15,
            studentClass: '9A',
            interests: [],
            xp: 0,
            level: 1,
            role: 'student',
            language: 'en',
            theme: 'light',
            bio: '',
            geniusMode: true,
            learningDepth: 'Deep',
            explanationStyle: 'Metaphorical'
          };
          
          setDoc(userDocRef, newUser).catch(err => {
            console.warn("Could not create initial profile in Firestore:", err);
          });
          
          setProfile(newUser);
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile fetch error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAuthReady, 
      geniusMode, 
      setGeniusMode, 
      updateProfileData,
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut, 
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
