import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import type { UserProfile } from "@/types";

export const profileSchema = z.object({
  age: z.coerce.number().min(18, "Must be 18 or older").max(90),
  country: z.string().min(2),
  employment: z.enum(["Salaried", "Self-Employed", "Business Owner", "Student", "Retired"]),
  annualIncome: z.coerce.number().min(0),
  creditScore: z.coerce.number().min(300).max(900),
  monthlyExpenses: z.coerce.number().min(0),
  shoppingSpend: z.coerce.number().min(0),
  travelSpend: z.coerce.number().min(0),
  fuelSpend: z.coerce.number().min(0),
  diningSpend: z.coerce.number().min(0),
  entertainmentSpend: z.coerce.number().min(0),
  onlineShoppingSpend: z.coerce.number().min(0),
  existingCards: z.array(z.string()),
  preferredBenefits: z.array(
    z.enum([
      "travel",
      "lounge",
      "fuel",
      "dining",
      "shopping",
      "online",
      "entertainment",
      "insurance",
      "international",
    ]),
  ),
  rewardPreference: z.enum(["Cashback", "Points", "Miles", "Hybrid"]),
  maxAnnualFee: z.coerce.number().min(0),
});

export const defaultProfile: UserProfile = {
  age: 30,
  country: "India",
  employment: "Salaried",
  annualIncome: 1200000,
  creditScore: 760,
  monthlyExpenses: 60000,
  shoppingSpend: 12000,
  travelSpend: 8000,
  fuelSpend: 5000,
  diningSpend: 7000,
  entertainmentSpend: 3000,
  onlineShoppingSpend: 15000,
  existingCards: [],
  preferredBenefits: ["online", "lounge"],
  rewardPreference: "Cashback",
  maxAnnualFee: 2500,
};

const PROFILE_KEY = "ccai.profile";
const SAVED_KEY = "ccai.saved";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useStoredProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfileState(read<UserProfile | null>(PROFILE_KEY, null));
    setHydrated(true);
  }, []);

  const setProfile = useCallback((next: UserProfile) => {
    setProfileState(next);
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }, []);

  return { profile, setProfile, hydrated };
}

export function useSavedCards() {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(read<string[]>(SAVED_KEY, []));
    setHydrated(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSaved(next);
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      persist(saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]);
    },
    [saved, persist],
  );

  return { saved, toggle, hydrated };
}
