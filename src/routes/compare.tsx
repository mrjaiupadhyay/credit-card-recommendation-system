import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardVisual } from "@/components/card-visual";
import { creditCards, getCardById } from "@/data/cards";
import { formatINR } from "@/lib/recommend";
import type { CreditCard } from "@/types";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Credit Cards Side by Side — CreditCardAI" },
      {
        name: "description",
        content:
          "Compare annual fees, joining fees, cashback, rewards, lounge access, travel, fuel, dining, movies and insurance across Indian credit cards.",
      },
      { property: "og:title", content: "Compare Credit Cards Side by Side — CreditCardAI" },
      {
        property: "og:description",
        content: "A single table with every fee, reward and perk that matters.",
      },
    ],
  }),
  component: ComparePage,
});

const MAX = 4;

const rows: Array<{ label: string; render: (c: CreditCard) => React.ReactNode }> = [
  { label: "Annual fee", render: (c) => (c.annualFee === 0 ? "Lifetime free" : formatINR(c.annualFee)) },
  { label: "Joining fee", render: (c) => (c.joiningFee === 0 ? "Nil" : formatINR(c.joiningFee)) },
  { label: "Cashback / reward rate", render: (c) => `${c.rewardRate}%` },
  { label: "Reward type", render: (c) => c.rewardType },
  { label: "Airport lounge", render: (c) => <Meter value={c.scores.lounge} /> },
  { label: "Travel", render: (c) => <Meter value={c.scores.travel} /> },
  { label: "Fuel", render: (c) => <Meter value={c.scores.fuel} /> },
  { label: "Dining", render: (c) => <Meter value={c.scores.dining} /> },
  { label: "Movies & entertainment", render: (c) => <Meter value={c.scores.entertainment} /> },
  { label: "Insurance", render: (c) => <Meter value={c.scores.insurance} /> },
  { label: "Min. income", render: (c) => formatINR(c.minIncome) },
  { label: "Min. credit score", render: (c) => String(c.minCreditScore) },
  {
    label: "Rating",
    render: (c) => (
      <span className="inline-flex items-center gap-1 text-gold">
        <Star className="size-3.5 fill-current" />
        {c.rating}
      </span>
    ),
  },
];

function Meter({ value }: { value: number }) {
  if (value === 0) return <Minus className="size-4 text-muted-foreground" />;
  if (value >= 8) return <Check className="size-4 text-primary" />;
  return <span className="text-sm text-muted-foreground">{value}/10</span>;
}

function ComparePage() {
  const [selected, setSelected] = useState<string[]>([
    "hdfc-infinia",
    "sbi-cashback",
    "icici-amazon-pay",
  ]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length >= MAX ? prev : [...prev, id],
    );

  const cards = selected.map((id) => getCardById(id)).filter((c): c is CreditCard => Boolean(c));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Compare cards</h1>
      <p className="mt-2 text-muted-foreground">Pick up to {MAX} cards to line up side by side.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {creditCards.map((c) => {
          const active = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={
                active
                  ? "surface-brand rounded-full px-4 py-2 text-sm font-medium"
                  : "rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
              }
            >
              {c.name}
              {active && <X className="ml-1 inline size-3.5" />}
            </button>
          );
        })}
      </div>

      {cards.length === 0 ? (
        <div className="glass mt-10 rounded-3xl p-10 text-center text-muted-foreground">
          Select at least one card to start comparing.
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.id} className="glass rounded-3xl p-4">
                <CardVisual card={c} />
                <p className="mt-3 font-display font-semibold">{c.name}</p>
                <Badge variant="secondary" className="mt-2">
                  {c.bank}
                </Badge>
              </div>
            ))}
          </div>

          <div className="glass mt-8 overflow-x-auto rounded-3xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-44">Feature</TableHead>
                  {cards.map((c) => (
                    <TableHead key={c.id} className="min-w-40">
                      {c.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    {cards.map((c) => (
                      <TableCell key={c.id}>{row.render(c)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" className="mt-6" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </>
      )}
    </div>
  );
}
