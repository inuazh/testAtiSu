import { createFileRoute } from '@tanstack/react-router';
import { RouteErrorState } from '@/app/ui/RouteErrorState';
import { auctionBetsQueryOptions, auctionDetailQueryOptions } from '@/entities/auction';
import { AuctionDetailPage } from '@/pages/auction-detail';

export const Route = createFileRoute('/auctions/$auctionUuid/')({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(auctionDetailQueryOptions(params.auctionUuid)),
      context.queryClient.ensureQueryData(auctionBetsQueryOptions(params.auctionUuid)),
    ]);
  },
  errorComponent: ({ error }) => (
    <RouteErrorState title="Не удалось загрузить аукцион" error={error} />
  ),
  component: AuctionDetailPage,
});
