import { getRouteApi } from '@tanstack/react-router';

const route = getRouteApi('/auctions/$auctionUuid/bid');

export function AuctionBidPage() {
  const { auctionUuid } = route.useParams();

  return (
    <section>
      <h1 className="text-xl font-semibold">Ставка по аукциону {auctionUuid}</h1>
    </section>
  );
}
