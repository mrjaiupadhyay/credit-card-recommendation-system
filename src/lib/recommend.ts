import { creditCards } from "@/data/cards";
import type { BenefitKey, CreditCard, ScoredCard, UserProfile } from "@/types";

const BENEFIT_LABELS: Record<BenefitKey, string> = {
  travel: "Travel",
  lounge: "Airport lounge",
  fuel: "Fuel",
  dining: "Dining",
  shopping: "Shopping",
  online: "Online shopping",
  entertainment: "Movies & entertainment",
  insurance: "Insurance",
  international: "International usage",
};

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

interface SpendMix {
  travel: number;
  fuel: number;
  dining: number;
  shopping: number;
  online: number;
  entertainment: number;
}

function spendMix(p: UserProfile): { totals: SpendMix; total: number } {
  const totals: SpendMix = {
    travel: p.travelSpend,
    fuel: p.fuelSpend,
    dining: p.diningSpend,
    shopping: p.shoppingSpend,
    online: p.onlineShoppingSpend,
    entertainment: p.entertainmentSpend,
  };
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  return { totals, total };
}

/**
 * Deterministic scoring engine.
 * Weighted components:
 *  - Spend alignment (40): how well the card's category strengths map to the user's spend mix
 *  - Reward economics (20): effective annual value net of fees, relative to spends
 *  - Eligibility fit (15): income + credit score + employment headroom
 *  - Fee comfort (12): effective annual fee vs. user's stated ceiling
 *  - Preferred benefits (8): explicitly selected benefit categories
 *  - Reward type match (5): cashback vs points vs miles preference
 */
export function scoreCard(card: CreditCard, profile: UserProfile): ScoredCard {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const { totals, total } = spendMix(profile);

  // 1. Spend alignment
  let alignment = 0;
  if (total > 0) {
    (Object.keys(totals) as Array<keyof SpendMix>).forEach((k) => {
      alignment += (totals[k] / total) * card.scores[k];
    });
  } else {
    alignment = 5;
  }
  const spendScore = (alignment / 10) * 40;

  const topCategory = ((Object.keys(totals) as Array<keyof SpendMix>).sort(
    (a, b) => totals[b] - totals[a],
  )[0] ?? "shopping") as keyof SpendMix;
  if (total > 0 && card.scores[topCategory] >= 7) {
    reasons.push(
      `Strong on ${BENEFIT_LABELS[topCategory]}, your largest monthly category at ${inr(totals[topCategory])}.`,
    );
  }

  // 2. Reward economics — annual value net of effective fee
  const annualSpend = total * 12;
  const grossValue = annualSpend * (card.rewardRate / 100);
  const waived = card.feeWaiverSpend !== null && annualSpend >= card.feeWaiverSpend;
  const effectiveFee = waived ? 0 : card.annualFee;
  const netValue = grossValue - effectiveFee;
  const valueRatio = annualSpend > 0 ? netValue / annualSpend : 0;
  const economicsScore = clamp((valueRatio / 0.04) * 20, -10, 20);
  if (netValue > 0) {
    reasons.push(
      `Estimated ${inr(netValue)} of net annual value on ${inr(annualSpend)} of yearly spends.`,
    );
  } else {
    warnings.push("At your current spends the fee outweighs the rewards earned.");
  }
  if (waived) reasons.push(`Annual fee waived once you cross ${inr(card.feeWaiverSpend!)} a year.`);

  // 3. Eligibility
  let eligibility = 15;
  if (profile.annualIncome < card.minIncome) {
    const gap = card.minIncome / Math.max(profile.annualIncome, 1);
    eligibility -= gap > 1.5 ? 15 : 9;
    warnings.push(`Income requirement is ${inr(card.minIncome)} per year.`);
  } else {
    reasons.push("You comfortably clear the income eligibility bar.");
  }
  if (profile.creditScore < card.minCreditScore) {
    eligibility -= profile.creditScore < card.minCreditScore - 40 ? 12 : 6;
    warnings.push(`Issuer typically looks for a credit score of ${card.minCreditScore}+.`);
  } else {
    reasons.push(`Your ${profile.creditScore} credit score meets the ${card.minCreditScore}+ bar.`);
  }
  if (!card.employment.includes(profile.employment)) {
    eligibility -= 8;
    warnings.push(`Rarely issued to applicants in the ${profile.employment} category.`);
  }
  eligibility = clamp(eligibility, -12, 15);

  // 4. Fee comfort
  let feeScore: number;
  if (effectiveFee <= profile.maxAnnualFee) {
    feeScore = 12 - (effectiveFee / Math.max(profile.maxAnnualFee, 1)) * 3;
    if (effectiveFee === 0) reasons.push("No effective annual fee for you.");
  } else {
    const over = effectiveFee / Math.max(profile.maxAnnualFee, 1);
    feeScore = over > 2 ? -8 : -3;
    warnings.push(`Annual fee of ${inr(effectiveFee)} is above your ${inr(profile.maxAnnualFee)} ceiling.`);
  }

  // 5. Preferred benefits
  let prefScore = 0;
  if (profile.preferredBenefits.length > 0) {
    const avg =
      profile.preferredBenefits.reduce((sum, b) => sum + card.scores[b], 0) /
      profile.preferredBenefits.length;
    prefScore = (avg / 10) * 8;
    const matched = profile.preferredBenefits.filter((b) => card.scores[b] >= 8);
    if (matched.length) {
      reasons.push(
        `Covers your priority benefits: ${matched.map((m) => BENEFIT_LABELS[m].toLowerCase()).join(", ")}.`,
      );
    }
  } else {
    prefScore = 4;
  }

  // 6. Reward type
  const typeScore =
    card.rewardType === profile.rewardPreference
      ? 5
      : card.rewardType === "Hybrid" || profile.rewardPreference === "Hybrid"
        ? 3
        : 1;
  if (typeScore === 5) reasons.push(`Earns in ${card.rewardType.toLowerCase()}, exactly as you prefer.`);

  // Penalty for cards already held
  const duplicate = profile.existingCards.includes(card.id);
  const duplicatePenalty = duplicate ? 25 : 0;
  if (duplicate) warnings.push("You already hold this card.");

  const raw =
    spendScore + economicsScore + eligibility + feeScore + prefScore + typeScore - duplicatePenalty;
  const matchScore = Math.round(clamp(raw, 1, 100));

  return {
    card,
    matchScore,
    reasons: reasons.slice(0, 4),
    warnings,
    estimatedAnnualValue: Math.round(netValue),
  };
}

export function recommendCards(profile: UserProfile): ScoredCard[] {
  return creditCards
    .map((card) => scoreCard(card, profile))
    .sort((a, b) => b.matchScore - a.matchScore || b.estimatedAnnualValue - a.estimatedAnnualValue);
}

export const formatINR = inr;
export const benefitLabels = BENEFIT_LABELS;
