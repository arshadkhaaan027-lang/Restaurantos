import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseUserProfile,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  CustomerProfile,
  CustomerMembership,
} from '../types/restaurant';
import {
  getCustomerProfile,
  saveCustomerProfile,
  getLoyaltyMembership,
  DEFAULT_CAFE_ID,
  SUPPORTED_CAFES,
} from '../services/restaurantService';

interface AuthContextType {
  user: User | null;
  customerProfile: CustomerProfile | null;
  loyaltyMembership: CustomerMembership | null;
  isLoading: boolean;
  currentCafeId: string;
  setCurrentCafeId: (cafeId: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    phone: string
  ) => Promise<void>;
  loginWithPhone: (phoneNumber: string, otpCode: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<{ testCode: string }>;
  loginAsDemoCustomer: (role?: 'vip' | 'new') => Promise<void>;
  updateProfileData: (updates: Partial<CustomerProfile>) => Promise<void>;
  refreshMembership: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loyaltyMembership, setLoyaltyMembership] = useState<CustomerMembership | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentCafeId, setCurrentCafeId] = useState<string>(() => {
    return localStorage.getItem('restaurantos_cafe_id') || DEFAULT_CAFE_ID;
  });

  // Track pending OTP for phone verification
  const [pendingOtpPhone, setPendingOtpPhone] = useState<string>('');

  const handleCafeChange = (newCafeId: string) => {
    setCurrentCafeId(newCafeId);
    localStorage.setItem('restaurantos_cafe_id', newCafeId);
  };

  // Sync profile and loyalty whenever user or cafeId changes
  const loadUserData = async (currentUser: User, cafeId: string) => {
    try {
      const [profile, membership] = await Promise.all([
        getCustomerProfile(cafeId, currentUser.uid),
        getLoyaltyMembership(cafeId, currentUser.uid),
      ]);

      if (profile) {
        setCustomerProfile(profile);
      } else {
        // Create initial base profile if not yet existing
        const initialProfile: CustomerProfile = {
          uid: currentUser.uid,
          cafeId,
          fullName: currentUser.displayName || 'Guest Diner',
          email: currentUser.email || '',
          phone: currentUser.phoneNumber || localStorage.getItem('restaurantos_customer_phone') || '',
          dateOfBirth: '',
          photoURL: currentUser.photoURL || '',
          favouriteDishes: ['dish_ribeye', 'dish_carbonara'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveCustomerProfile(cafeId, initialProfile);
        setCustomerProfile(initialProfile);
      }

      setLoyaltyMembership(membership);
    } catch (err) {
      console.warn('Error loading user data from Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser, currentCafeId);
      } else {
        setCustomerProfile(null);
        setLoyaltyMembership(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentCafeId]);

  const refreshMembership = async () => {
    if (user) {
      const mem = await getLoyaltyMembership(currentCafeId, user.uid);
      setLoyaltyMembership(mem);
    }
  };

  // Email login
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await loadUserData(cred.user, currentCafeId);
    } finally {
      setIsLoading(false);
    }
  };

  // Email registration
  const registerWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    phone: string
  ) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseUserProfile(cred.user, { displayName: fullName });

      const newProfile: CustomerProfile = {
        uid: cred.user.uid,
        cafeId: currentCafeId,
        fullName,
        email,
        phone,
        dateOfBirth: '',
        favouriteDishes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveCustomerProfile(currentCafeId, newProfile);
      setCustomerProfile(newProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Phone OTP
  const sendPhoneOtp = async (phoneNumber: string) => {
    setPendingOtpPhone(phoneNumber);
    // In preview environment, return the deterministic OTP verification code for seamless customer testing
    const testCode = '654321';
    return { testCode };
  };

  // Phone Login with OTP
  const loginWithPhone = async (phoneNumber: string, otpCode: string) => {
    setIsLoading(true);
    try {
      if (otpCode !== '654321' && otpCode !== '123456') {
        throw new Error('Invalid OTP code. Please use the verification code sent to your phone (654321).');
      }

      // Format a clean deterministic email for phone authentication mapping
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const syntheticEmail = `phone_${cleanPhone}@restaurantos.customer`;
      const deterministicSecret = `ROS_Phone_${cleanPhone}!2026`;

      let currentUser: User;
      try {
        const cred = await signInWithEmailAndPassword(auth, syntheticEmail, deterministicSecret);
        currentUser = cred.user;
      } catch {
        // If first time with this phone number, create user
        const newCred = await createUserWithEmailAndPassword(auth, syntheticEmail, deterministicSecret);
        currentUser = newCred.user;
      }

      // Check or create profile with mobile number
      let prof = await getCustomerProfile(currentCafeId, currentUser.uid);
      if (!prof) {
        prof = {
          uid: currentUser.uid,
          cafeId: currentCafeId,
          fullName: `Member ${cleanPhone.slice(-4)}`,
          email: '',
          phone: phoneNumber,
          dateOfBirth: '',
          favouriteDishes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveCustomerProfile(currentCafeId, prof);
      }
      setCustomerProfile(prof);
      await refreshMembership();
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login for instant user testing
  const loginAsDemoCustomer = async (role: 'vip' | 'new' = 'vip') => {
    setIsLoading(true);
    try {
      const demoEmail = role === 'vip' ? 'aarav.sharma@example.com' : 'priya.patel@example.com';
      const demoPass = 'RestaurantOS123!';
      const demoName = role === 'vip' ? 'Aarav Sharma' : 'Priya Patel';
      const demoPhone = role === 'vip' ? '+91 98201 54321' : '+91 98765 43210';

      let currentUser: User;
      try {
        const res = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        currentUser = res.user;
      } catch {
        const newRes = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        currentUser = newRes.user;
        await updateFirebaseUserProfile(currentUser, { displayName: demoName });
      }

      let prof = await getCustomerProfile(currentCafeId, currentUser.uid);
      if (!prof) {
        prof = {
          uid: currentUser.uid,
          cafeId: currentCafeId,
          fullName: demoName,
          email: demoEmail,
          phone: demoPhone,
          dateOfBirth: '1992-08-15',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          favouriteDishes: ['dish_ribeye', 'dish_woodfire_pizza', 'dish_carbonara'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveCustomerProfile(currentCafeId, prof);
      }
      setCustomerProfile(prof);
      await loadUserData(currentUser, currentCafeId);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile data in Firestore
  const updateProfileData = async (updates: Partial<CustomerProfile>) => {
    if (!user || !customerProfile) return;
    const updated: CustomerProfile = {
      ...customerProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveCustomerProfile(currentCafeId, updated);
    setCustomerProfile(updated);

    if (updates.fullName) {
      await updateFirebaseUserProfile(user, { displayName: updates.fullName });
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setCustomerProfile(null);
    setLoyaltyMembership(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        loyaltyMembership,
        isLoading,
        currentCafeId,
        setCurrentCafeId: handleCafeChange,
        loginWithEmail,
        registerWithEmail,
        loginWithPhone,
        sendPhoneOtp,
        loginAsDemoCustomer,
        updateProfileData,
        refreshMembership,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
