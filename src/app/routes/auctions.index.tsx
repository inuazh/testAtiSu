import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router';
import { RouteErrorState } from '@/app/ui/RouteErrorState';
import { auctionListQueryOptions } from '@/entities/auction';
import { buildListRequest, parseAuctionSearch } from '@/features/auction-filters';
import { AuctionsListPage } from '@/pages/auctions-list';

export const Route = createFileRoute('/auctions/')({
  validateSearch: (input: Record<string, unknown> & SearchSchemaInput) => parseAuctionSearch(input),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(auctionListQueryOptions(buildListRequest(deps.search))),
  errorComponent: ({ error }) => (
    <RouteErrorState title="Не удалось загрузить список аукционов" error={error} />
  ),
  component: AuctionsListPage,
});
