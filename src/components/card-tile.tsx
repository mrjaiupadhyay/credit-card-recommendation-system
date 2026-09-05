import { Link } from "@tanstack/react-router";
import { Bookmark, Star } from "lucide-react";
import { CardVisual } from "@/components/card-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/recommend";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types";

export function CardTile({
  card,
  saved,
  onToggleSave,
  footer,
}: {
  card: CreditCard;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  footer?: React.ReactNode;
}) {
  return (
    <article className="glass flex flex-col gap-4 rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1">
      <CardVisual card={card} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{card.name}</h3>
          <p className="text-sm text-muted-foreground">{card.bank}</p>
        </div>
        <span className="flex items-center gap-1 text-sm text-gold">
          <Star className="size-4 fill-current" />
          {card.rating}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{card.rewardType}</Badge>
        <Badge variant="secondary">{card.rewardRate}% back</Badge>
        <Badge variant="secondary">
          {card.annualFee === 0 ? "Lifetime free" : `${formatINR(card.annualFee)}/yr`}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{card.highlights[0]}</p>
      {footer}
      <div className="mt-auto flex gap-2 pt-1">
        <Button asChild className="flex-1">
          <Link to="/cards/$cardId" params={{ cardId: card.id }}>
            View details
          </Link>
        </Button>
        {onToggleSave && (
          <Button
            variant="outline"
            size="icon"
            aria-label={saved ? "Remove bookmark" : "Bookmark card"}
            onClick={() => onToggleSave(card.id)}
          >
            <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
          </Button>
        )}
      </div>
    </article>
  );
}
