import { Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types";

export function CardVisual({
  card,
  className,
  size = "md",
}: {
  card: CreditCard;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white/90 shadow-[var(--shadow-elev)]",
        card.accent,
        size === "sm" && "max-w-[220px] p-3",
        size === "lg" && "p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "font-display font-semibold uppercase tracking-widest opacity-80",
            size === "lg" ? "text-sm" : "text-[10px]",
          )}
        >
          {card.bank}
        </span>
        <Wifi className={cn("rotate-90 opacity-70", size === "lg" ? "size-6" : "size-4")} />
      </div>
      <div className={cn("h-6 w-9 rounded bg-gold/80", size === "lg" && "h-9 w-12")} />
      <div>
        <p className={cn("font-display font-semibold", size === "lg" ? "text-2xl" : "text-base")}>
          {card.name}
        </p>
        <p className={cn("opacity-70", size === "lg" ? "text-sm" : "text-[11px]")}>
          {card.network} · {card.rewardType}
        </p>
      </div>
    </div>
  );
}
