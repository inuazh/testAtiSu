import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type AuctionDetailVm, auctionBetsQueryOptions, mapBets } from '@/entities/auction';
import { getErrorMessage } from '@/shared/api';
import { Badge, Button, Card, Skeleton, StateMessage } from '@/shared/ui';

interface AuctionBetsProps {
  auction: AuctionDetailVm;
}

export function AuctionBets({ auction }: AuctionBetsProps) {
  const { restrictions } = auction;
  const query = useQuery({
    ...auctionBetsQueryOptions(auction.uuid),
    enabled: !restrictions.hideBetsHistory,
  });

  const bets = useMemo(
    () =>
      query.data === undefined
        ? null
        : mapBets(query.data, {
            hidden: restrictions.hideBetsHistory,
            placesHidden: restrictions.hidePlaces,
            ownOrganizationId: auction.ownOrganizationId,
          }),
    [query.data, restrictions.hideBetsHistory, restrictions.hidePlaces, auction.ownOrganizationId],
  );

  if (restrictions.hideBetsHistory) {
    return (
      <Card title="Ставки">
        <StateMessage
          title="История ставок скрыта"
          description="Организатор закрыл список ставок по этому аукциону."
        />
      </Card>
    );
  }

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

  if (bets === null || bets.items.length === 0) {
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
      {bets.placesHidden && (
        <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Места в рейтинге скрыты организатором
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {bets.items.map((bet) => (
          <li
            key={bet.key}
            className={`rounded-md border p-3 ${bet.isRejected ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{bet.organizationName}</span>
                {bet.isMy && <Badge variant="info">Моя ставка</Badge>}
                {bet.isWin && <Badge variant="success">Победитель</Badge>}
                {bet.isCounter && <Badge variant="warning">Встречная</Badge>}
                {bet.isRejected && <Badge variant="danger">Отклонена</Badge>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{bet.priceWithVat} с НДС</p>
                <p className="text-xs text-slate-500">{bet.priceNoVat} без НДС</p>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
              <span>Место: {bet.place}</span>
              <span>ИНН: {bet.organizationInn}</span>
              <span>{bet.createdAt}</span>
            </div>
            {bet.isRejected && (
              <p className="mt-1 text-xs text-red-600">Причина отклонения: {bet.cancelReason}</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
