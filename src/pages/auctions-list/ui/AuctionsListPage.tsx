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
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Аукционы</h1>
        <p className="text-sm text-slate-500">
          Фильтры синхронизированы с адресной строкой — ссылку можно переслать как есть.
        </p>
      </header>

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
