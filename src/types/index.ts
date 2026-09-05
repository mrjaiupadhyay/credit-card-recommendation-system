export type RewardType = "Cashback" | "Points" | "Miles" | "Hybrid";

export interface CreditCard {
  id: string;
  bank: string;
  name: string;
  network: string;
  joiningFee: number;
  annualFee: number;
  feeWaiverSpend: number | null;
  rewardRate: number; // effective % value back
  rewardType: RewardType;
  minIncome: number; // annual, INR
  minCreditScore: number;
  employment: Array<"Salaried" | "Self-Employed" | "Business Owner" | "Student" | "Retired">;
  scores: {
    travel: number;
    lounge: number;
    fuel: number;
    dining: number;
    shopping: number;
    online: number;
    entertainment: number;
    insurance: number;
    international: number;
  };
  rating: number;
  highlights: string[];
  pros: string[];
  cons: string[];
  eligibility: string[];
  accent: string;
}

export type BenefitKey =
  | "travel"
  | "lounge"
  | "fuel"
  | "dining"
  | "shopping"
  | "online"
  | "entertainment"
  | "insurance"
  | "international";

export interface UserProfile {
  age: number;
  country: string;
  employment: "Salaried" | "Self-Employed" | "Business Owner" | "Student" | "Retired";
  annualIncome: number;
  creditScore: number;
  monthlyExpenses: number;
  shoppingSpend: number;
  travelSpend: number;
  fuelSpend: number;
  diningSpend: number;
  entertainmentSpend: number;
  onlineShoppingSpend: number;
  existingCards: string[];
  preferredBenefits: BenefitKey[];
  rewardPreference: RewardType;
  maxAnnualFee: number;
}

export interface ScoredCard {
  card: CreditCard;
  matchScore: number;
  reasons: string[];
  warnings: string[];
  estimatedAnnualValue: number;
}
