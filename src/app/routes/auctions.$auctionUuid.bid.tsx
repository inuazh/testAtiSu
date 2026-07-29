import { createFileRoute } from '@tanstack/react-router';
import { RouteErrorState } from '@/app/ui/RouteErrorState';
import { auctionDetailQueryOptions } from '@/entities/auction';
import { AuctionBidPage } from '@/pages/auction-bid';

export const Route = createFileRoute('/auctions/$auctionUuid/bid')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(auctionDetailQueryOptions(params.auctionUuid)),
  errorComponent: ({ error }) => (
    <RouteErrorState title="Не удалось загрузить аукцион" error={error} />
  ),
  component: AuctionBidPage,
});
