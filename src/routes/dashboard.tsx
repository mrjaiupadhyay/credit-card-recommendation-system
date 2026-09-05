import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bookmark, CreditCard as CreditCardIcon, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTile } from "@/components/card-tile";
import { getCardById } from "@/data/cards";
import { formatINR, recommendCards } from "@/lib/recommend";
import { useSavedCards, useStoredProfile } from "@/lib/profile-store";
import type { CreditCard } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Spending Dashboard — CreditCardAI" },
      {
        name: "description",
        content:
          "Visualise your monthly category spends, track bookmarked cards and review your latest credit card match scores.",
      },
      { property: "og:title", content: "Spending Dashboard — CreditCardAI" },
      {
        property: "og:description",
        content: "Charts for your spend mix plus your saved card portfolio.",
      },
    ],
  }),
  component: DashboardPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

function DashboardPage() {
  const { profile, hydrated } = useStoredProfile();
  const { saved, toggle } = useSavedCards();

  const spendData = useMemo(() => {
    if (!profile) return [];
    return [
      { name: "Online", value: profile.onlineShoppingSpend },
      { name: "Shopping", value: profile.shoppingSpend },
      { name: "Travel", value: profile.travelSpend },
      { name: "Dining", value: profile.diningSpend },
      { name: "Fuel", value: profile.fuelSpend },
      { name: "Entertainment", value: profile.entertainmentSpend },
    ].filter((d) => d.value > 0);
  }, [profile]);

  const results = useMemo(() => (profile ? recommendCards(profile).slice(0, 5) : []), [profile]);
  const savedCards = saved.map((id) => getCardById(id)).filter((c): c is CreditCard => Boolean(c));
  const totalSpend = spendData.reduce((a, b) => a + b.value, 0);

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-muted-foreground">Loading…</div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">No profile yet</h1>
        <p className="mt-3 text-muted-foreground">
          Complete the spending profile to unlock charts and recommendations.
        </p>
        <Button asChild className="mt-6">
          <Link to="/profile">Create profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        A snapshot of how you spend and which cards fit best.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Tracked monthly spends" value={formatINR(totalSpend)} />
        <Kpi icon={TrendingUp} label="Best match score" value={`${results[0]?.matchScore ?? 0}%`} />
        <Kpi
          icon={CreditCardIcon}
          label="Est. net annual value"
          value={formatINR(results[0]?.estimatedAnnualValue ?? 0)}
        />
        <Kpi icon={Bookmark} label="Bookmarked cards" value={String(savedCards.length)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl font-semibold">Monthly spending mix</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {spendData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {spendData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl font-semibold">Top match scores</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results.map((r) => ({ name: r.card.name, score: r.matchScore }))}>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="score" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {results.map((r) => (
              <li key={r.card.id} className="flex justify-between">
                <span>{r.card.name}</span>
                <span>{r.matchScore}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Saved cards</h2>
          <Button asChild variant="outline">
            <Link to="/cards">Browse cards</Link>
          </Button>
        </div>
        {savedCards.length === 0 ? (
          <div className="glass mt-4 rounded-3xl p-10 text-center text-muted-foreground">
            No bookmarks yet — tap the bookmark icon on any card.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {savedCards.map((c) => (
              <CardTile key={c.id} card={c} saved onToggleSave={toggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-3xl p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
