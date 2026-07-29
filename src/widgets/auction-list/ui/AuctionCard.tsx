import { Link } from '@tanstack/react-router';
import { type AuctionListItemVm, PRIMARY_ACTION } from '@/entities/auction';
import { Badge, Button } from '@/shared/ui';

interface AuctionCardProps {
  auction: AuctionListItemVm;
  onIntent: (auctionUuid: string) => void;
}

export function AuctionCard({ auction, onIntent }: AuctionCardProps) {
  const { trading, primaryAction } = auction;
  const bidTarget = primaryAction.kind === PRIMARY_ACTION.ViewBets ? 'detail' : 'bid';

  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
      onMouseEnter={() => onIntent(auction.uuid)}
      onFocus={() => onIntent(auction.uuid)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <Link
          to="/auctions/$auctionUuid"
          params={{ auctionUuid: auction.uuid }}
          className="text-sm font-semibold text-slate-900 underline-offset-2 hover:underline"
        >
          {auction.cargoNum}
        </Link>
        <Badge variant={auction.statusTone}>{auction.statusLabel}</Badge>
        <Badge variant="info">{auction.aucTypeLabel}</Badge>
        <Badge variant={trading.statusTone}>{trading.statusLabel}</Badge>
        {trading.hasMyBet && <Badge variant="success">Моя ставка есть</Badge>}
      </header>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {auction.routeFrom} → {auction.routeTo}
          </p>
          <p className="text-xs text-slate-500">
            {auction.loadDate} → {auction.unloadDate}
          </p>
          <p className="text-xs text-slate-500">{auction.distance}</p>
        </div>

        <div>
          <p className="text-sm text-slate-900">{auction.cargo.name}</p>
          <p className="text-xs text-slate-500">
            {auction.cargo.weight} · {auction.cargo.volume}
          </p>
          <p className="text-xs text-slate-500">{auction.cargo.bodyTypeLabel}</p>
        </div>

        <div className="sm:text-right">
          <p className="text-base font-semibold text-slate-900">{trading.currentPrice}</p>
          <p className="text-xs text-slate-500">{trading.pricePerKm}</p>
          <p className="text-xs text-slate-500">Шаг: {trading.step}</p>
        </div>
      </div>

      <footer className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {trading.hasMyBet ? `Моя ставка: ${trading.myBetPrice}` : 'Своей ставки нет'}
        </p>
        {primaryAction.disabled ? (
          <Button size="sm" disabled>
            {primaryAction.label}
          </Button>
        ) : (
          <Link
            to={bidTarget === 'bid' ? '/auctions/$auctionUuid/bid' : '/auctions/$auctionUuid'}
            params={{ auctionUuid: auction.uuid }}
          >
            <Button size="sm">{primaryAction.label}</Button>
          </Link>
        )}
      </footer>
    </article>
  );
}
