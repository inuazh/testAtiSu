import { getRouteApi } from '@tanstack/react-router';
import {
  AuctionFilters,
  type AuctionSearch,
  clearFilters,
  countActiveFilters,
} from '@/features/auction-filters';
import { AuctionList } from '@/widgets/auction-list';

const route = getRouteApi('/auctions/');

export function AuctionsListPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const activeCount = countActiveFilters(search);

  const replaceSearch = (next: AuctionSearch) => {
    void navigate({ search: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Аукционы</h1>

      <AuctionFilters search={search} activeCount={activeCount} onChange={replaceSearch} />

      <AuctionList
        search={search}
        hasActiveFilters={activeCount > 0}
        onPageChange={(page) => replaceSearch({ ...search, page })}
        onResetFilters={() => replaceSearch(clearFilters(search))}
      />
    </div>
  );
}
