import { useQuery } from '@tanstack/react-query';
import { auctionBetsQueryOptions } from '@/entities/auction';
import { getErrorMessage } from '@/shared/api';
import { Badge, Button, Card, Skeleton, StateMessage } from '@/shared/ui';

interface AuctionBetsProps {
  auctionUuid: string;
}

export function AuctionBets({ auctionUuid }: AuctionBetsProps) {
  const query = useQuery(auctionBetsQueryOptions(auctionUuid));

  if (query.isPending) {
    return (
      <Card title="Ставки">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, index) => index).map((index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card title="Ставки">
        <StateMessage
          tone="danger"
          title="Не удалось загрузить ставки"
          description={getErrorMessage(query.error)}
          action={
            <Button size="sm" variant="secondary" onClick={() => void query.refetch()}>
              Повторить
            </Button>
          }
        />
      </Card>
    );
  }

  const bets = query.data;

  if (bets.hidden) {
    return (
      <Card title="Ставки">
        <StateMessage
          title="История ставок скрыта"
          description={`Организатор закрыл список ставок. Участников: ${bets.participantsCount}.`}
        />
      </Card>
    );
  }

  if (bets.items.length === 0) {
    return (
      <Card title="Ставки">
        <StateMessage
          title="Ставок пока нет"
          description="Вы можете стать первым участником торгов."
        />
      </Card>
    );
  }

  return (
    <Card title={`Ставки · участников: ${bets.participantsCount}`}>
      <ul className="flex flex-col gap-2">
        {bets.items.map((bet) => (
          <li
            key={bet.uuid}
            className={`rounded-md border p-3 ${bet.isCancelled ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{bet.carrierName}</span>
                {bet.isMy && <Badge variant="info">Моя ставка</Badge>}
                {bet.isWinner && <Badge variant="success">Победитель</Badge>}
                {bet.isCancelled && <Badge variant="danger">Отменена</Badge>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{bet.priceWithVat} с НДС</p>
                <p className="text-xs text-slate-500">{bet.priceWithoutVat} без НДС</p>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
              <span>Место: {bet.rank}</span>
              <span>ИНН: {bet.carrierInn}</span>
              <span>{bet.createdAt}</span>
            </div>
            {bet.isCancelled && (
              <p className="mt-1 text-xs text-red-600">Причина отмены: {bet.cancelReason}</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
