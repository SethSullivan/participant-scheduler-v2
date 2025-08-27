"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface GapiContextType {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
}

const GapiContext = createContext<GapiContextType | undefined>(undefined);

export function GapiProvider({ children }: { children: ReactNode }) {
const [isReady, setIsReady] = useState(false);
const [isLoading, setIsLoading] = useState(true); // Start as loading
const [error, setError] = useState<string | null>(null);