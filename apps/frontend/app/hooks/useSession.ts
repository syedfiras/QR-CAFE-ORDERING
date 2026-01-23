"use client";

import { useState, useEffect, useCallback } from "react";
import { startSession, validateSession, SessionStatus } from "../services/api";

const SESSION_STORAGE_KEY = "cafe_session_token";
const TABLE_STORAGE_KEY = "cafe_session_table";

export interface UseSessionReturn {
  sessionToken: string | null;
  sessionStatus: SessionStatus | null;
  isLoading: boolean;
  isValid: boolean;
  isReadOnly: boolean;
  initializeSession: (tableNumber: number) => Promise<void>;
  clearSession: () => void;
}

/**
 * Custom hook for managing table sessions
 * 
 * - Reads session_token from localStorage
 * - Validates existing session or creates new one
 * - Provides session status for UI decisions
 */
export function useSession(tableNumber: string | null): UseSessionReturn {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount or when table changes
  useEffect(() => {
    if (!tableNumber) {
      setIsLoading(false);
      return;
    }

    const initialize = async () => {
      setIsLoading(true);
      
      try {
        // Check localStorage for existing session
        const storedToken = localStorage.getItem(SESSION_STORAGE_KEY);
        const storedTable = localStorage.getItem(TABLE_STORAGE_KEY);
        
        // If stored token exists and is for the same table
        if (storedToken && storedTable === tableNumber) {
          // Validate the existing session
          const validation = await validateSession(storedToken);
          
          if (validation.session_token) {
            setSessionToken(validation.session_token);
            setSessionStatus(validation.status);
            setIsLoading(false);
            return;
          }
        }
        
        // No valid session - create a new one
        const session = await startSession(Number(tableNumber), storedToken || undefined);
        
        // Store the new session
        localStorage.setItem(SESSION_STORAGE_KEY, session.session_token);
        localStorage.setItem(TABLE_STORAGE_KEY, tableNumber);
        
        setSessionToken(session.session_token);
        setSessionStatus(session.status);
      } catch (error) {
        console.error("Session initialization error:", error);
        // Clear invalid session data
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(TABLE_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [tableNumber]);

  // Manual initialization function (for force refresh)
  const initializeSession = useCallback(async (table: number) => {
    setIsLoading(true);
    
    try {
      const session = await startSession(table);
      
      localStorage.setItem(SESSION_STORAGE_KEY, session.session_token);
      localStorage.setItem(TABLE_STORAGE_KEY, String(table));
      
      setSessionToken(session.session_token);
      setSessionStatus(session.status);
    } catch (error) {
      console.error("Session creation error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear session (for "New Order" action)
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(TABLE_STORAGE_KEY);
    setSessionToken(null);
    setSessionStatus(null);
  }, []);

  return {
    sessionToken,
    sessionStatus,
    isLoading,
    isValid: sessionStatus === "ACTIVE",
    isReadOnly: sessionStatus === "COMPLETED" || sessionStatus === "EXPIRED",
    initializeSession,
    clearSession,
  };
}

/**
 * Get stored session token without React hooks (for non-component usage)
 */
export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

/**
 * Get stored table number
 */
export function getStoredTableNumber(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TABLE_STORAGE_KEY);
}
