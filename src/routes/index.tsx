import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Coins,
  LayoutDashboard,
  Plane,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardVisual } from "@/components/card-visual";
import { creditCards } from "@/data/cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CreditCardAI — Find the Perfect Credit Card for Every Purchase" },
      {
        name: "description",
        content:
          "AI-powered credit card recommendations based on your spending habits. Score 14+ Indian cards on fees, rewards, lounge access and more.",
      },
      { property: "og:title", content: "CreditCardAI — Find the Perfect Credit Card" },
      {
        property: "og:description",
        content: "AI-powered recommendations based on your spending habits.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Coins, title: "Cashback Optimizer", body: "Maximise return on groceries, bills and online spends." },
  { icon: Plane, title: "Travel Rewards", body: "Miles, lounge access and low forex markups, ranked." },
  { icon: ShoppingBag, title: "Shopping Benefits", body: "Merchant-specific accelerators mapped to your carts." },
  { icon: Brain, title: "AI Recommendation Engine", body: "Six weighted signals score every card deterministically." },
  { icon: BarChart3, title: "Compare Cards", body: "Side-by-side fees, rewards and perks in one table." },
  { icon: LayoutDashboard, title: "Personalized Dashboard", body: "Spend breakdown, saved cards and match history." },
];

const testimonials = [
  {
    name: "Ananya Rao",
    role: "Product Designer, Bengaluru",
    quote: "Switched to the card it suggested and I'm saving about ₹31,000 a year on the same spends.",
  },
  {
    name: "Vikram Shetty",
    role: "Founder, Mumbai",
    quote: "Finally a recommendation tool that shows the maths instead of pushing affiliate links.",
  },
  {
    name: "Meera Iyer",
    role: "Consultant, Delhi",
    quote: "The lounge and forex weighting nailed exactly what I needed for 30 flights a year.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "₹0",
    body: "Everything you need to pick your next card.",
    perks: ["Full card database", "Top 3 recommendations", "Compare up to 4 cards"],
  },
  {
    name: "Plus",
    price: "₹299",
    body: "For optimisers running multiple cards.",
    perks: ["Unlimited comparisons", "Spend breakdown charts", "Saved card portfolio", "Match history"],
    featured: true,
  },
  {
    name: "Advisor",
    price: "₹999",
    body: "For wealth managers and finance creators.",
    perks: ["Multi-profile workspaces", "Exportable reports", "Priority dataset updates"],
  },
];

const faqs = [
  {
    q: "How does the scoring engine work?",
    a: "Every card gets a weighted score across spend alignment (40), reward economics (20), eligibility fit (15), fee comfort (12), preferred benefits (8) and reward type match (5). Nothing is random — the same profile always returns the same ranking.",
  },
  {
    q: "Do you earn commission on applications?",
    a: "No. Rankings come purely from your inputs and the published card terms in our dataset.",
  },
  {
    q: "Which cards are covered?",
    a: "Popular Indian cards across HDFC, Axis, ICICI, SBI Card, Amex, HSBC, IDFC FIRST, Kotak and AU Small Finance Bank.",
  },
  {
    q: "Is my data stored anywhere?",
    a: "Your spending profile stays in your browser. Nothing is uploaded to a server.",
  },
];

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function Landing() {
  const showcase = creditCards.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <section className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <motion.div {...fade}>
          <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1">
            Deterministic matching · 14 Indian cards
          </Badge>
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Find the <span className="text-gradient">Perfect Credit Card</span> for Every Purchase
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            AI-powered recommendations based on your spending habits.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/profile">
                Get Started <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/cards">Learn More</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              ["14", "Cards scored"],
              ["6", "Weighted signals"],
              ["₹0", "Cost to use"],
            ].map(([v, l]) => (
              <div key={l} className="glass rounded-2xl p-4">
                <dt className="font-display text-2xl font-semibold">{v}</dt>
                <dd className="text-xs text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-md"
        >
          {showcase.map((card, i) => (
            <motion.div
              key={card.id}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginTop: i === 0 ? 0 : -70, marginLeft: i * 26, zIndex: 10 - i }}
              className="relative"
            >
              <CardVisual card={card} size="lg" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-16">
        <motion.h2 {...fade} className="font-display text-3xl font-semibold sm:text-4xl">
          Built for people who read the fine print
        </motion.h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="glass rounded-3xl p-6"
            >
              <span className="surface-brand mb-4 flex size-10 items-center justify-center rounded-2xl">
                <f.icon className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <motion.h2 {...fade} className="font-display text-3xl font-semibold sm:text-4xl">
          Loved by careful spenders
        </motion.h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              {...fade}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="glass rounded-3xl p-6"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="block text-muted-foreground">{t.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className="py-16">
        <motion.h2 {...fade} className="font-display text-3xl font-semibold sm:text-4xl">
          Simple pricing
        </motion.h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pricing.map((p, i) => (
            <motion.div
              key={p.name}
              {...fade}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className={
                p.featured
                  ? "glass rounded-3xl border-primary/50 p-6 ring-1 ring-primary/40"
                  : "glass rounded-3xl p-6"
              }
            >
              {p.featured && <Badge className="mb-3">Most popular</Badge>}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
              <p className="mt-4 font-display text-4xl font-bold">
                {p.price}
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" /> {perk}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={p.featured ? "default" : "outline"}>
                <Link to="/profile">Start free</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <motion.h2 {...fade} className="font-display text-3xl font-semibold sm:text-4xl">
          Questions, answered
        </motion.h2>
        <Accordion type="single" collapsible className="glass mt-8 rounded-3xl px-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
