import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardTile } from "@/components/card-tile";
import { banks, creditCards } from "@/data/cards";
import { formatINR } from "@/lib/recommend";
import { useSavedCards } from "@/lib/profile-store";

export const Route = createFileRoute("/cards/")({
  head: () => ({
    meta: [
      { title: "Explore Indian Credit Cards — CreditCardAI" },
      {
        name: "description",
        content:
          "Instant search across Indian credit cards with filters for bank, annual fee, reward type, income, credit score, travel and cashback.",
      },
      { property: "og:title", content: "Explore Indian Credit Cards — CreditCardAI" },
      {
        property: "og:description",
        content: "Filter cards by bank, fee, reward type, eligibility and benefits.",
      },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const { saved, toggle } = useSavedCards();
  const [query, setQuery] = useState("");
  const [bank, setBank] = useState("all");
  const [rewardType, setRewardType] = useState("all");
  const [maxFee, setMaxFee] = useState(15000);
  const [income, setIncome] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [travelOnly, setTravelOnly] = useState(false);
  const [cashbackOnly, setCashbackOnly] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return creditCards.filter((c) => {
      if (q && !`${c.name} ${c.bank} ${c.network} ${c.highlights.join(" ")}`.toLowerCase().includes(q))
        return false;
      if (bank !== "all" && c.bank !== bank) return false;
      if (rewardType !== "all" && c.rewardType !== rewardType) return false;
      if (c.annualFee > maxFee) return false;
      if (income && c.minIncome > Number(income)) return false;
      if (creditScore && c.minCreditScore > Number(creditScore)) return false;
      if (travelOnly && c.scores.travel < 7) return false;
      if (cashbackOnly && c.rewardType !== "Cashback") return false;
      return true;
    });
  }, [query, bank, rewardType, maxFee, income, creditScore, travelOnly, cashbackOnly]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Explore cards</h1>
      <p className="mt-2 text-muted-foreground">
        Instant search across every card in the CreditCardAI dataset.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="glass h-fit rounded-3xl p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards…"
              className="pl-9"
            />
          </div>

          <div className="mt-5 grid gap-5">
            <div className="grid gap-2">
              <Label>Bank</Label>
              <Select value={bank} onValueChange={setBank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All banks</SelectItem>
                  {banks.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Reward type</Label>
              <Select value={rewardType} onValueChange={setRewardType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["all", "Cashback", "Points", "Miles", "Hybrid"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r === "all" ? "All types" : r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label>Max annual fee: {formatINR(maxFee)}</Label>
              <Slider
                value={[maxFee]}
                max={15000}
                step={500}
                onValueChange={([v]) => setMaxFee(v ?? 0)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Your annual income (₹)</Label>
              <Input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 1200000"
              />
            </div>

            <div className="grid gap-2">
              <Label>Your credit score</Label>
              <Input
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                placeholder="e.g. 760"
              />
            </div>

            <label className="flex items-center justify-between text-sm">
              Strong travel benefits
              <Switch checked={travelOnly} onCheckedChange={setTravelOnly} />
            </label>
            <label className="flex items-center justify-between text-sm">
              Cashback cards only
              <Switch checked={cashbackOnly} onCheckedChange={setCashbackOnly} />
            </label>
          </div>
        </aside>

        <section>
          <p className="mb-4 text-sm text-muted-foreground">{results.length} cards match</p>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c) => (
              <CardTile
                key={c.id}
                card={c}
                saved={saved.includes(c.id)}
                onToggleSave={toggle}
              />
            ))}
          </div>
          {results.length === 0 && (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              No cards match these filters. Try loosening the fee or eligibility limits.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
