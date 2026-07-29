import { useQuery } from '@tanstack/react-query';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { auctionDetailQueryOptions } from '@/entities/auction';
import { CreateBetForm } from '@/features/create-bet';
import { getErrorMessage } from '@/shared/api';
import { Badge, Button, Card, DataList, Skeleton, StateMessage } from '@/shared/ui';

const route = getRouteApi('/auctions/$auctionUuid/bid');

export function AuctionBidPage() {
  const { auctionUuid } = route.useParams();
  const navigate = useNavigate();
  const query = useQuery(auctionDetailQueryOptions(auctionUuid));

  const goToDetail = () => {
    void navigate({ to: '/auctions/$auctionUuid', params: { auctionUuid } });
  };

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <StateMessage
        tone="danger"
        title="Не удалось загрузить аукцион"
        description={getErrorMessage(query.error)}
        action={
          <Button size="sm" variant="secondary" onClick={() => void query.refetch()}>
            Повторить
          </Button>
        }
      />
    );
  }

  const auction = query.data;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <header>
        <Link
          to="/auctions/$auctionUuid"
          params={{ auctionUuid }}
          className="text-xs text-slate-500 hover:underline"
        >
          ← К карточке аукциона
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Ставка по заявке {auction.cargoNum}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={auction.statusTone}>{auction.statusLabel}</Badge>
          <Badge variant="info">{auction.aucTypeLabel}</Badge>
          <Badge variant={auction.trading.statusTone}>{auction.trading.statusLabel}</Badge>
        </div>
      </header>

      <Card title="Параметры торгов">
        <DataList
          rows={[
            { label: 'Текущая цена', value: auction.trading.currentPrice },
            { label: 'Доступная цена', value: auction.trading.availablePrice },
            { label: 'Шаг ставки', value: auction.trading.step },
            { label: 'Минимум', value: auction.trading.min },
            { label: 'Максимум', value: auction.trading.max },
            {
              label: 'Моя ставка',
              value: auction.trading.hasMyBet ? auction.trading.myBetPrice : 'Ставка не сделана',
            },
          ]}
        />
      </Card>

      <Card title={auction.trading.hasMyBet ? 'Изменить ставку' : 'Сделать ставку'}>
        <CreateBetForm auction={auction} onDone={goToDetail} />
      </Card>
    </div>
  );
}
