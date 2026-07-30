import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { auctionDetailQueryOptions, auctionListQueryOptions } from '@/entities/auction';
import { type AuctionSearch, buildListRequest } from '@/features/auction-filters';
import { getErrorMessage } from '@/shared/api';
import { Button, StateMessage } from '@/shared/ui';
import { AuctionCard } from './AuctionCard';
import { AuctionCardSkeleton } from './AuctionCardSkeleton';
import { Pagination } from './Pagination';

interface AuctionListProps {
  search: AuctionSearch;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function AuctionList({
  search,
  onPageChange,
  onResetFilters,
  hasActiveFilters,
}: AuctionListProps) {
  const queryClient = useQueryClient();
  const request = buildListRequest(search);
  const query = useQuery(auctionListQueryOptions(request));

  const handleIntent = useCallback(
    (auctionUuid: string) => {
      if (auctionUuid !== '') {
        void queryClient.prefetchQuery(auctionDetailQueryOptions(auctionUuid));
      }
    },
    [queryClient],
  );

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, index) => index).map((index) => (
          <AuctionCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <StateMessage
        tone="danger"
        title="Не удалось загрузить список аукционов"
        description={getErrorMessage(query.error)}
        action={
          <Button size="sm" variant="secondary" onClick={() => void query.refetch()}>
            Повторить
          </Button>
        }
      />
    );
  }

  const list = query.data;

  if (list.items.length === 0) {
    return (
      <StateMessage
        title="Аукционы не найдены"
        description={
          hasActiveFilters
            ? 'Под текущие фильтры ничего не подошло. Попробуйте ослабить условия.'
            : 'Пока нет ни одного аукциона.'
        }
        action={
          hasActiveFilters ? (
            <Button size="sm" variant="secondary" onClick={onResetFilters}>
              Сбросить фильтры
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`flex flex-col gap-3 transition-opacity ${query.isFetching ? 'opacity-60' : ''}`}
      >
        {list.items.map((auction) => (
          <AuctionCard key={auction.uuid} auction={auction} onIntent={handleIntent} />
        ))}
      </div>
      <Pagination
        page={list.currentPage}
        pagesCount={list.lastPage}
        total={list.total}
        onPageChange={onPageChange}
      />
    </div>
  );
}
