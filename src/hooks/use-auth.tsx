"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  AppUser,
  AuthResult,
  clearStoredSession,
  createTransaction as createSupabaseTransaction,
  deleteTransaction as deleteSupabaseTransaction,
  restoreStoredSession,
  signInWithEmail as signInWithEmailRequest,
  signInWithGoogle as signInWithGoogleRequest,
  signOut as signOutRequest,
  signUpWithEmail as signUpWithEmailRequest,
  supabaseConfigured,
  Transaction as SupabaseTransaction,
  TransactionData,
  updateAuthMetadata,
  updateTransaction as updateSupabaseTransaction,
  upsertProfile,
  uploadProfileImage as uploadProfileImageRequest,
} from "@/lib/supabase";
import { AppTimestamp } from "@/lib/app-timestamp";
import { toast } from "./use-toast";

export interface UserProfile extends Record<string, any> {
  uid: string;
  farmerId?: string;
  email: string | null;
  phone?: string | null;
  displayName: string | null;
  photoURL: string | null;
  location?: string;
  language?: string;
  crops?: string;
  memberSince?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: SupabaseTransaction["date"];
}

interface AuthContextType {
  user: AppUser | null;
  userProfile: UserProfile | null;
  transactions: Transaction[];
  sessionToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsDemoFarmer: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  addTransaction: (data: TransactionData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionData>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const DEFAULT_DEMO_USER: AppUser = {
  id: "demo-farmer-001",
  email: "harshuppal300@gmail.com",
  displayName: "Harsh Uppal",
  photoURL: null,
};

const DEFAULT_DEMO_PROFILE: UserProfile = {
  uid: "demo-farmer-001",
  farmerId: "BM-KSN-2026-7842",
  displayName: "Harsh Uppal",
  email: "harshuppal300@gmail.com",
  phone: "8905905953",
  photoURL: null,
  location: "Haryana, India",
  language: "hi",
  crops: "Wheat, Mustard, Paddy",
  memberSince: "2026",
};

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    description: "Wheat crop sale (Mandi)",
    amount: 85000,
    type: "income",
    category: "Crop Sale",
    date: AppTimestamp.now(),
  },
  {
    id: "tx-2",
    description: "Fertilizer & Seeds purchase",
    amount: 14500,
    type: "expense",
    category: "Inputs",
    date: AppTimestamp.now(),
  },
  {
    id: "tx-3",
    description: "Tractor diesel & servicing",
    amount: 6200,
    type: "expense",
    category: "Machinery",
    date: AppTimestamp.now(),
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(DEFAULT_DEMO_USER);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEFAULT_DEMO_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DEMO_TRANSACTIONS);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>("demo-session-token");

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        if (supabaseConfigured) {
          const result = await restoreStoredSession();
          if (!mounted) return;

          if (result) {
            setSessionToken(result.session.access_token);
            setUser(result.user);
            setUserProfile(result.profile);
            setTransactions(result.transactions);
            return;
          }
        }
      } catch (error) {
        console.warn("Supabase session restore skipped, using demo session", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (supabaseConfigured) {
        await signInWithGoogleRequest();
        return;
      }
    } catch (err) {
      console.warn("Supabase Google sign-in failed, using demo auth", err);
    }
    setUser(DEFAULT_DEMO_USER);
    setUserProfile(DEFAULT_DEMO_PROFILE);
    setSessionToken("demo-google-token");
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (supabaseConfigured) {
        const result = await signInWithEmailRequest(email, pass);
        hydrateAuthState(result);
        return;
      }
    } catch (error) {
      console.warn("Supabase email sign-in failed, using demo auth", error);
    }

    const demoUser: AppUser = {
      id: "farmer-" + Math.random().toString(36).slice(2, 7),
      email: email || "farmer@beejmantra.in",
      displayName: email ? email.split("@")[0] : "Ram Kishan",
      photoURL: null,
    };
    const demoProfile: UserProfile = {
      uid: demoUser.id,
      displayName: demoUser.displayName,
      email: demoUser.email,
      photoURL: null,
      location: "Haryana, India",
      language: "hi",
      crops: "Wheat, Mustard",
    };
    setUser(demoUser);
    setUserProfile(demoProfile);
    setSessionToken("demo-token-" + Date.now());
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await signInWithEmail(email, pass);
  };

  const signInAsDemoFarmer = async () => {
    setLoading(true);
    const demoUser: AppUser = {
      id: "demo-farmer-ramesh",
      email: "ramesh.kisan@beejmantra.in",
      displayName: "रामेश कुमार (Ramesh Kumar)",
      photoURL: "/desi-farmer-hero.jpg",
    };
    const demoProfile: UserProfile = {
      uid: "demo-farmer-ramesh",
      email: "ramesh.kisan@beejmantra.in",
      displayName: "रामेश कुमार (Ramesh Kumar)",
      photoURL: "/desi-farmer-hero.jpg",
      location: "Karnal, Haryana",
      language: "hi",
      crops: "Wheat (गेहूं), Mustard (सरसों), Rice (धान)",
    };
    const demoTransactions: Transaction[] = [
      {
        id: "tx-1",
        description: "Mustard Crop Sale (सरसों बिक्री)",
        amount: 48500,
        type: "income",
        category: "Crop Sale",
        date: {
          seconds: Math.floor((Date.now() - 86400000 * 2) / 1000),
          nanoseconds: 0,
          toDate: () => new Date(Date.now() - 86400000 * 2),
          toMillis: () => Date.now() - 86400000 * 2,
        } as any,
      },
      {
        id: "tx-2",
        description: "DAP Fertilizer Purchase (डीएपी खाद)",
        amount: 2700,
        type: "expense",
        category: "Fertilizers",
        date: {
          seconds: Math.floor((Date.now() - 86400000 * 5) / 1000),
          nanoseconds: 0,
          toDate: () => new Date(Date.now() - 86400000 * 5),
          toMillis: () => Date.now() - 86400000 * 5,
        } as any,
      },
      {
        id: "tx-3",
        description: "PM-Kisan Samman Nidhi (पीएम-किसान किस्त)",
        amount: 2000,
        type: "income",
        category: "Gov Scheme",
        date: {
          seconds: Math.floor((Date.now() - 86400000 * 10) / 1000),
          nanoseconds: 0,
          toDate: () => new Date(Date.now() - 86400000 * 10),
          toMillis: () => Date.now() - 86400000 * 10,
        } as any,
      },
      {
        id: "tx-4",
        description: "Tractor Diesel (डीजल खर्च)",
        amount: 3200,
        type: "expense",
        category: "Fuel",
        date: {
          seconds: Math.floor((Date.now() - 86400000 * 14) / 1000),
          nanoseconds: 0,
          toDate: () => new Date(Date.now() - 86400000 * 14),
          toMillis: () => Date.now() - 86400000 * 14,
        } as any,
      },
    ];

    const demoSession = {
      access_token: "demo-session-token-beejmantra",
      refresh_token: "demo-refresh-token",
      expires_at: Date.now() + 86400000 * 30,
      user: {
        id: "demo-farmer-ramesh",
        email: "ramesh.kisan@beejmantra.in",
        user_metadata: {
          full_name: "रामेश कुमार (Ramesh Kumar)",
          avatar_url: "/desi-farmer-hero.jpg",
        },
      },
    };

    try {
      localStorage.setItem("beejmantra.supabase.session", JSON.stringify(demoSession));
      localStorage.setItem("beejmantra_preferred_lang", "hi");
    } catch {}

    setUser(demoUser);
    setUserProfile(demoProfile);
    setTransactions(demoTransactions);
    setSessionToken("demo-session-token-beejmantra");
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (supabaseConfigured) {
        await signOutRequest();
      }
    } catch (error) {
      console.warn("Sign-out failed", error);
    }
    clearStoredSession();
    setUser(null);
    setUserProfile(null);
    setSessionToken(null);
    setTransactions([]);
    setLoading(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const nextProfile: UserProfile = {
      uid: user?.id || "demo-farmer-001",
      farmerId: data.farmerId ?? userProfile?.farmerId ?? ("BM-KSN-2026-" + Math.floor(1000 + Math.random() * 9000)),
      email: data.email ?? userProfile?.email ?? user?.email ?? "harshuppal300@gmail.com",
      phone: data.phone ?? userProfile?.phone ?? "8905905953",
      displayName: data.displayName ?? userProfile?.displayName ?? user?.displayName ?? "Harsh Uppal",
      photoURL: data.photoURL ?? userProfile?.photoURL ?? null,
      location: data.location ?? userProfile?.location ?? "Haryana, India",
      language: data.language ?? userProfile?.language ?? "hi",
      crops: data.crops ?? userProfile?.crops ?? "Wheat, Mustard",
      memberSince: data.memberSince ?? userProfile?.memberSince ?? "2026",
    };

    if (supabaseConfigured && sessionToken && sessionToken !== "demo-session-token-beejmantra" && user) {
      try {
        await updateAuthMetadata(sessionToken, {
          displayName: nextProfile.displayName,
          photoURL: nextProfile.photoURL,
        });
        await upsertProfile(sessionToken, nextProfile);
      } catch (err) {
        console.warn("Supabase profile update skipped", err);
      }
    }

    if (user) {
      setUser({ ...user, displayName: nextProfile.displayName, photoURL: nextProfile.photoURL });
    }
    setUserProfile(nextProfile);
  };

  const uploadProfileImage = async (file: File): Promise<void> => {
    if (sessionToken === "demo-session-token-beejmantra") {
      await updateUserProfile({ photoURL: "/desi-farmer-hero.jpg" });
      return;
    }

    if (!user || !sessionToken) {
      throw new Error("No user is currently signed in.");
    }

    try {
      if (supabaseConfigured) {
        const downloadURL = await uploadProfileImageRequest(sessionToken, user.id, file);
        await updateUserProfile({ photoURL: downloadURL });
        return;
      }
    } catch (error: any) {
      console.warn("Remote upload failed, using local object url", error);
    }

    const localUrl = URL.createObjectURL(file);
    await updateUserProfile({ photoURL: localUrl });
  };

  // Transaction Management
  const addTransaction = async (data: TransactionData) => {
    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: AppTimestamp.fromDate(data.date),
    };

    if (sessionToken === "demo-session-token-beejmantra") {
      setTransactions((current) => [newTx, ...current]);
      return;
    }

    if (supabaseConfigured && sessionToken && user) {
      try {
        const created = await createSupabaseTransaction(sessionToken, user.id, data);
        setTransactions((current) => [created, ...current].sort((a, b) => b.date.toMillis() - a.date.toMillis()));
        return;
      } catch (err) {
        console.warn("Supabase transaction save failed, falling back to local", err);
      }
    }

    setTransactions((current) => [newTx, ...current].sort((a, b) => b.date.toMillis() - a.date.toMillis()));
  };

  const updateTransaction = async (id: string, data: Partial<TransactionData>) => {
    if (sessionToken === "demo-session-token-beejmantra") {
      setTransactions((current) =>
        current.map((tx) =>
          tx.id === id
            ? {
                ...tx,
                description: data.description ?? tx.description,
                amount: data.amount ?? tx.amount,
                type: data.type ?? tx.type,
                category: data.category ?? tx.category,
                date: data.date ? AppTimestamp.fromDate(data.date) : tx.date,
              }
            : tx
        )
      );
      return;
    }

    if (supabaseConfigured && sessionToken && user) {
      try {
        const updated = await updateSupabaseTransaction(sessionToken, id, data);
        setTransactions((current) =>
          current
            .map((transaction) => (transaction.id === id ? updated : transaction))
            .sort((a, b) => b.date.toMillis() - a.date.toMillis()),
        );
        return;
      } catch (err) {
        console.warn("Supabase transaction update failed", err);
      }
    }

    setTransactions((current) =>
      current.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              description: data.description ?? tx.description,
              amount: data.amount ?? tx.amount,
              type: data.type ?? tx.type,
              category: data.category ?? tx.category,
              date: data.date ? AppTimestamp.fromDate(data.date) : tx.date,
            }
          : tx,
      ),
    );
  };

  const deleteTransaction = async (id: string) => {
    if (sessionToken === "demo-session-token-beejmantra") {
      setTransactions((current) => current.filter((tx) => tx.id !== id));
      return;
    }

    if (supabaseConfigured && sessionToken && user) {
      try {
        await deleteSupabaseTransaction(sessionToken, id);
      } catch (err) {
        console.warn("Supabase transaction delete failed", err);
      }
    }

    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  };

  const hydrateAuthState = (result: AuthResult) => {
    setSessionToken(result.session.access_token);
    setUser(result.user);
    setUserProfile(result.profile);
    setTransactions(result.transactions);
    setLoading(false);
  };

  const value = {
    user,
    userProfile,
    transactions,
    sessionToken,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsDemoFarmer,
    signOut,
    updateUserProfile,
    uploadProfileImage,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
