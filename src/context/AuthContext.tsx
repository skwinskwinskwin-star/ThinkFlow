
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  geniusMode: boolean;
  setGeniusMode: (mode: boolean) => void;
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
  const [geniusMode, setGeniusMode] = useState(true);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // PRIORITY BYPASS: Demo Mode
    if (email === 'demo@thinkflow.ai' && password === 'demo123456') {
      console.log('Entering Demo Genius Mode...');
      const mockUser = {
        id: 'demo-uid-123',
        email: 'demo@thinkflow.ai',
        user_metadata: { name: 'Demo Genius' }
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    
    if (data.user) {
      const newUser: UserProfile = {
        uid: data.user.id,
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
        bio: ''
      };
      try {
        const { error: profileError } = await supabase.from('users').insert(newUser);
        if (profileError) {
          console.warn("Could not create profile in 'users' table. This is likely because the table doesn't exist yet.", profileError);
        }
      } catch (e) {
        console.error("Profile creation failed:", e);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      // In Supabase, deleting an account usually requires a service role or a specific API call
      // For this demo, we'll just mark it as deleted in the profile
      const { error: profileError } = await supabase
        .from('users')
        .update({ bio: (profile?.bio || '') + ' [DELETED]' })
        .eq('uid', user.id);
      
      if (profileError) throw profileError;
      
      // Sign out
      await signOut();
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('uid', user.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116' || error.message?.includes('relation "public.users" does not exist')) {
            // Profile doesn't exist or table doesn't exist, create a local fallback
            const newUser: UserProfile = {
              uid: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || 'New User',
              age: 15,
              studentClass: '9A',
              interests: [],
              xp: 0,
              level: 1,
              role: 'student',
              language: 'en',
              theme: 'light',
              bio: ''
            };
            
            // Try to insert if table exists, otherwise just set local state
            try {
              const { error: insertError } = await supabase.from('users').insert(newUser);
              if (insertError) {
                console.warn("Table 'users' might be missing. Using local profile state.");
              }
            } catch (e) {}
            
            setProfile(newUser);
          } else {
            console.error("Profile fetch error:", error);
          }
        } else {
          setProfile(data as UserProfile);
        }
        setLoading(false);
      };

      fetchProfile();

      // Subscribe to profile changes
      const channel = supabase
        .channel('public:users')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `uid=eq.${user.id}`
        }, (payload) => {
          setProfile(payload.new as UserProfile);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
