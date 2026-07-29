import { getRouteApi } from '@tanstack/react-router';

const route = getRouteApi('/auctions/$auctionUuid/');

export function AuctionDetailPage() {
  const { auctionUuid } = route.useParams();

  return (
    <section>
      <h1 className="text-xl font-semibold">Аукцион {auctionUuid}</h1>
    </section>
  );
}
