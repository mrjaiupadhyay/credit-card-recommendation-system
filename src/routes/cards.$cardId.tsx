import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, Check, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CardVisual } from "@/components/card-visual";
import { getCardById } from "@/data/cards";
import { benefitLabels, formatINR, scoreCard } from "@/lib/recommend";
import { useSavedCards, useStoredProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";
import type { BenefitKey } from "@/types";

export const Route = createFileRoute("/cards/$cardId")({
  loader: ({ params }) => {
    const card = getCardById(params.cardId);
    if (!card) throw notFound();
    return { card };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Card unavailable — CreditCardAI" }, { name: "robots", content: "noindex" }] };
    }
    const { card } = loaderData;
    const title = `${card.name} by ${card.bank} — Fees, Rewards & Benefits`;
    const description = `${card.name}: ${card.highlights[0]} Annual fee ${card.annualFee === 0 ? "nil" : `₹${card.annualFee}`}, ${card.rewardRate}% effective rewards.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CardDetail,
});

function CardDetail() {
  const { card } = Route.useLoaderData();
  const { saved, toggle } = useSavedCards();
  const { profile } = useStoredProfile();
  const scored = profile ? scoreCard(card, profile) : null;
  const isSaved = saved.includes(card.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <CardVisual card={card} size="lg" />
          <div className="glass mt-6 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Community rating</span>
              <span className="flex items-center gap-1 text-gold">
                <Star className="size-4 fill-current" /> {card.rating}
              </span>
            </div>
            {scored && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your match score</span>
                  <span className="font-display text-xl font-semibold text-gradient">
                    {scored.matchScore}%
                  </span>
                </div>
                <Progress className="mt-2" value={scored.matchScore} />
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <Button className="flex-1" onClick={() => toast.success("Application flow coming soon")}>
                Apply now
              </Button>
              <Button variant="outline" size="icon" aria-label="Bookmark" onClick={() => toggle(card.id)}>
                <Bookmark className={cn("size-4", isSaved && "fill-primary text-primary")} />
              </Button>
            </div>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/compare">Add to comparison</Link>
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{card.bank}</p>
          <h1 className="font-display text-4xl font-bold">{card.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{card.network}</Badge>
            <Badge variant="secondary">{card.rewardType}</Badge>
            <Badge variant="secondary">{card.rewardRate}% effective rewards</Badge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Joining fee" value={card.joiningFee === 0 ? "Nil" : formatINR(card.joiningFee)} />
            <Stat label="Annual fee" value={card.annualFee === 0 ? "Lifetime free" : formatINR(card.annualFee)} />
            <Stat
              label="Fee waiver"
              value={card.feeWaiverSpend ? `${formatINR(card.feeWaiverSpend)} spends` : "Not applicable"}
            />
          </div>

          <Section title="Key benefits">
            <ul className="grid gap-2">
              {card.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {h}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Benefit strength">
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(card.scores) as BenefitKey[]).map((k) => (
                <div key={k}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{benefitLabels[k]}</span>
                    <span>{card.scores[k]}/10</span>
                  </div>
                  <Progress className="mt-1 h-1.5" value={card.scores[k] * 10} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Eligibility">
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {card.eligibility.map((e) => (
                <li key={e}>• {e}</li>
              ))}
              <li>• Accepted employment: {card.employment.join(", ")}</li>
            </ul>
          </Section>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="glass rounded-3xl p-5">
              <h3 className="font-display font-semibold">Pros</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {card.pros.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-3xl p-5">
              <h3 className="font-display font-semibold">Cons</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {card.cons.map((p) => (
                  <li key={p} className="flex gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
