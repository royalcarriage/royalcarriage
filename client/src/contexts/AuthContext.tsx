import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, UserRole, isSuperAdmin } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user data in Firestore
  const fetchUserData = async (firebaseUser: User): Promise<UserData> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    let role = UserRole.VIEWER; // Default role
    
    // Assign SuperAdmin role if email matches
    if (isSuperAdmin(firebaseUser.email)) {
      role = UserRole.SUPER_ADMIN;
    } else if (userSnap.exists()) {
      // Get role from Firestore if exists
      role = userSnap.data().role || UserRole.VIEWER;
    }

    const userData: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: role
    };

    // Create or update user document in Firestore
    await setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return userData;
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          const data = await fetchUserData(firebaseUser);
          setUser(firebaseUser);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const data = await fetchUserData(result.user);
      setUser(result.user);
      setUserData(data);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
