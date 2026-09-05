import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { creditCards } from "@/data/cards";
import { benefitLabels } from "@/lib/recommend";
import { defaultProfile, profileSchema, useStoredProfile } from "@/lib/profile-store";
import type { BenefitKey, UserProfile } from "@/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Spending Profile — CreditCardAI" },
      {
        name: "description",
        content:
          "Tell CreditCardAI about your income, credit score and monthly category spends to get matched cards.",
      },
      { property: "og:title", content: "Your Spending Profile — CreditCardAI" },
      {
        property: "og:description",
        content: "A four-step form that powers your personalised card ranking.",
      },
    ],
  }),
  component: ProfilePage,
});

const steps = ["About you", "Monthly spends", "Existing cards", "Preferences"] as const;

const benefitKeys = Object.keys(benefitLabels) as BenefitKey[];

function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile, hydrated } = useStoredProfile();
  const [step, setStep] = useState(0);

  const form = useForm<UserProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfile,
    mode: "onTouched",
  });

  useEffect(() => {
    if (hydrated && profile) form.reset(profile);
  }, [hydrated, profile, form]);

  const values = form.watch();

  const onSubmit = (data: UserProfile) => {
    setProfile(data);
    toast.success("Profile saved — scoring 14 cards");
    navigate({ to: "/recommendations" });
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleArray = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Your spending profile</h1>
      <p className="mt-2 text-muted-foreground">
        Four quick steps. Everything stays in your browser.
      </p>

      <div className="mt-8">
        <Progress value={((step + 1) / steps.length) * 100} />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          {steps.map((s, i) => (
            <span key={s} className={i === step ? "text-foreground" : undefined}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="glass mt-6 rounded-3xl p-6 sm:p-8">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Age" error={form.formState.errors.age?.message}>
                <Input type="number" {...form.register("age")} />
              </Field>
              <Field label="Country">
                <Input {...form.register("country")} />
              </Field>
              <Field label="Employment">
                <Select
                  value={values.employment}
                  onValueChange={(v) => form.setValue("employment", v as UserProfile["employment"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Salaried", "Self-Employed", "Business Owner", "Student", "Retired"].map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Annual income (₹)">
                <Input type="number" {...form.register("annualIncome")} />
              </Field>
              <Field label="Credit score" error={form.formState.errors.creditScore?.message}>
                <Input type="number" {...form.register("creditScore")} />
              </Field>
              <Field label="Total monthly expenses (₹)">
                <Input type="number" {...form.register("monthlyExpenses")} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Shopping / retail (₹ per month)">
                <Input type="number" {...form.register("shoppingSpend")} />
              </Field>
              <Field label="Online shopping (₹ per month)">
                <Input type="number" {...form.register("onlineShoppingSpend")} />
              </Field>
              <Field label="Travel (₹ per month)">
                <Input type="number" {...form.register("travelSpend")} />
              </Field>
              <Field label="Fuel (₹ per month)">
                <Input type="number" {...form.register("fuelSpend")} />
              </Field>
              <Field label="Dining (₹ per month)">
                <Input type="number" {...form.register("diningSpend")} />
              </Field>
              <Field label="Entertainment (₹ per month)">
                <Input type="number" {...form.register("entertainmentSpend")} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Select the cards you already hold so we don't recommend duplicates.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {creditCards.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 p-3 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={values.existingCards.includes(c.id)}
                      onCheckedChange={() =>
                        form.setValue("existingCards", toggleArray(values.existingCards, c.id))
                      }
                    />
                    <span>
                      <span className="block font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.bank}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              <div>
                <Label className="mb-3 block">Preferred benefits</Label>
                <div className="flex flex-wrap gap-2">
                  {benefitKeys.map((b) => {
                    const active = values.preferredBenefits.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() =>
                          form.setValue("preferredBenefits", toggleArray(values.preferredBenefits, b))
                        }
                        className={
                          active
                            ? "surface-brand rounded-full px-4 py-2 text-sm font-medium"
                            : "rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                        }
                      >
                        {benefitLabels[b]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Reward preference">
                  <Select
                    value={values.rewardPreference}
                    onValueChange={(v) =>
                      form.setValue("rewardPreference", v as UserProfile["rewardPreference"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Cashback", "Points", "Miles", "Hybrid"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Maximum annual fee (₹)">
                  <Input type="number" {...form.register("maxAnnualFee")} />
                </Field>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
            <ArrowLeft className="mr-1 size-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={next}>
              Continue <ArrowRight className="ml-1 size-4" />
            </Button>
          ) : (
            <Button type="submit">
              <Sparkles className="mr-1 size-4" /> Get my recommendations
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
