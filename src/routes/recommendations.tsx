import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Bookmark, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CardVisual } from "@/components/card-visual";
import { formatINR, recommendCards } from "@/lib/recommend";
import { useSavedCards, useStoredProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";
import type { ScoredCard } from "@/types";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Your Card Matches — CreditCardAI" },
      {
        name: "description",
        content:
          "See your top three credit card matches with match scores and a plain-English explanation of every ranking.",
      },
      { property: "og:title", content: "Your Card Matches — CreditCardAI" },
      {
        property: "og:description",
        content: "Match scores and reasons for every recommended card.",
      },
    ],
  }),
  component: RecommendationsPage,
});

const ranks = ["Top recommendation", "Runner up", "Third recommendation"];

function RecommendationsPage() {
  const { profile, hydrated } = useStoredProfile();
  const { saved, toggle } = useSavedCards();

  const results = useMemo(() => (profile ? recommendCards(profile) : []), [profile]);

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-muted-foreground">Scoring cards…</div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Build your profile first</h1>
        <p className="mt-3 text-muted-foreground">
          The engine needs your income, credit score and category spends before it can rank cards.
        </p>
        <Button asChild className="mt-6">
          <Link to="/profile">Start the 4-step form</Link>
        </Button>
      </div>
    );
  }

  const [top, ...rest] = results;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Your card matches</h1>
          <p className="mt-2 text-muted-foreground">
            {results.length} cards scored against your profile — highest match first.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/profile">Edit profile</Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {results.slice(0, 3).map((r, i) => (
          <motion.div
            key={r.card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "glass flex flex-col gap-4 rounded-3xl p-6",
              i === 0 && "ring-1 ring-primary/50",
            )}
          >
            <div className="flex items-center justify-between">
              <Badge variant={i === 0 ? "default" : "secondary"}>{ranks[i]}</Badge>
              <span className="font-display text-3xl font-bold text-gradient">{r.matchScore}%</span>
            </div>
            <CardVisual card={r.card} />
            <div>
              <h2 className="font-display text-xl font-semibold">{r.card.name}</h2>
              <p className="text-sm text-muted-foreground">{r.card.bank}</p>
            </div>
            <Progress value={r.matchScore} />
            <ul className="space-y-2 text-sm">
              {r.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
            {r.warnings.length > 0 && (
              <ul className="space-y-2 text-sm">
                {r.warnings.slice(0, 2).map((w) => (
                  <li key={w} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" />
                    <span className="text-muted-foreground">{w}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link to="/cards/$cardId" params={{ cardId: r.card.id }}>
                  View details
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Bookmark"
                onClick={() => toggle(r.card.id)}
              >
                <Bookmark
                  className={cn("size-4", saved.includes(r.card.id) && "fill-primary text-primary")}
                />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {top && (
        <div className="glass mt-10 rounded-3xl p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Sparkles className="size-5 text-primary" /> Why {top.card.name} came first
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            It scored {top.matchScore}% because your spend mix maps onto its strongest categories,
            and it returns an estimated {formatINR(top.estimatedAnnualValue)} of net value per year
            after fees. Scoring weights spend alignment 40%, reward economics 20%, eligibility 15%,
            fee comfort 12%, preferred benefits 8% and reward type 5%.
          </p>
        </div>
      )}

      <h2 className="mt-14 font-display text-2xl font-semibold">Full ranking</h2>
      <div className="glass mt-4 overflow-hidden rounded-3xl">
        {rest.map((r) => (
          <RankRow key={r.card.id} result={r} />
        ))}
      </div>
    </div>
  );
}

function RankRow({ result }: { result: ScoredCard }) {
  return (
    <Link
      to="/cards/$cardId"
      params={{ cardId: result.card.id }}
      className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4 last:border-0 hover:bg-accent/60"
    >
      <div>
        <p className="font-medium">{result.card.name}</p>
        <p className="text-sm text-muted-foreground">
          {result.card.bank} · {formatINR(result.card.annualFee)} annual fee
        </p>
      </div>
      <div className="text-right">
        <p className="font-display text-lg font-semibold">{result.matchScore}%</p>
        <p className="text-xs text-muted-foreground">
          {formatINR(result.estimatedAnnualValue)} net / yr
        </p>
      </div>
    </Link>
  );
}
