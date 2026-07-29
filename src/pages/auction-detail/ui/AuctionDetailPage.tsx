import { useQuery } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { auctionDetailQueryOptions, PRIMARY_ACTION } from '@/entities/auction';
import { getErrorMessage } from '@/shared/api';
import { Badge, Button, Card, DataList, Skeleton, StateMessage } from '@/shared/ui';
import { AuctionBets } from '@/widgets/auction-bets';

const route = getRouteApi('/auctions/$auctionUuid/');

export function AuctionDetailPage() {
  const { auctionUuid } = route.useParams();
  const query = useQuery(auctionDetailQueryOptions(auctionUuid));

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
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
  const { trading, restrictions, organizer, cargo } = auction;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/auctions" className="text-xs text-slate-500 hover:underline">
            ← К списку аукционов
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{auction.cargoNum}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={auction.statusTone}>{auction.statusLabel}</Badge>
            <Badge variant="info">{auction.aucTypeLabel}</Badge>
            <Badge variant={trading.statusTone}>{trading.statusLabel}</Badge>
          </div>
        </div>

        {auction.primaryAction.disabled ||
        auction.primaryAction.kind === PRIMARY_ACTION.ViewBets ? (
          <Button disabled={auction.primaryAction.disabled}>{auction.primaryAction.label}</Button>
        ) : (
          <Link to="/auctions/$auctionUuid/bid" params={{ auctionUuid }}>
            <Button>{auction.primaryAction.label}</Button>
          </Link>
        )}
      </header>

      <Card title="Основные данные">
        <DataList
          rows={[
            { label: 'Номер заявки', value: auction.cargoNum },
            { label: 'Тип аукциона', value: auction.aucTypeLabel },
            { label: 'Статус', value: auction.statusLabel },
            { label: 'Расстояние', value: auction.distance },
            { label: 'Торги до', value: trading.finishAt },
            { label: 'Комментарий', value: auction.comment },
          ]}
        />
      </Card>

      <Card title="Организатор">
        <DataList
          rows={[
            { label: 'Название', value: organizer.name },
            { label: 'ИНН', value: organizer.inn },
          ]}
        />
        {organizer.contactsHidden ? (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Контакты скрыты организатором
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1">
            {organizer.contacts.map((contact) => (
              <li key={`${contact.name}-${contact.phone}`} className="text-sm text-slate-700">
                {contact.name} · {contact.phone} · {contact.email}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Маршрут">
        {restrictions.hidePointsAddressAndContacts && (
          <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Адреса точек скрыты организатором
          </p>
        )}
        <ol className="flex flex-col gap-3">
          {auction.points.map((point) => (
            <li key={point.uuid} className="border-l-2 border-slate-200 pl-3">
              <p className="text-xs text-slate-500">{point.kindLabel}</p>
              <p className="text-sm font-medium text-slate-900">
                {point.cityName}
                <span className="font-normal text-slate-500"> · {point.regionName}</span>
              </p>
              <p className="text-xs text-slate-500">{point.address}</p>
              <p className="text-xs text-slate-500">{point.dateTime}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Груз и требования к ТС">
        <DataList
          rows={[
            { label: 'Груз', value: cargo.name },
            { label: 'Вес', value: cargo.weight },
            { label: 'Объём', value: cargo.volume },
            { label: 'Тип кузова', value: cargo.bodyTypeLabel },
            {
              label: 'Стоимость груза',
              value: cargo.priceHidden ? 'Скрыта организатором' : cargo.price,
            },
          ]}
        />
        {auction.vehicleRequirements !== null && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <DataList
              rows={[
                {
                  label: 'Допустимые кузова',
                  value: auction.vehicleRequirements.bodyTypeLabels.join(', '),
                },
                { label: 'Температурный режим', value: auction.vehicleRequirements.temperature },
                { label: 'Тип погрузки', value: auction.vehicleRequirements.loadingType },
                { label: 'Комментарий', value: auction.vehicleRequirements.comment },
              ]}
            />
          </div>
        )}
      </Card>

      {auction.paymentConditions !== null && (
        <Card title="Условия оплаты">
          <DataList
            rows={[
              { label: 'Форма оплаты', value: auction.paymentConditions.paymentType },
              { label: 'Отсрочка', value: auction.paymentConditions.deferment },
              { label: 'НДС', value: auction.paymentConditions.vatLabel },
            ]}
          />
        </Card>
      )}

      <Card title="Параметры торгов">
        <DataList
          rows={[
            { label: 'Текущая цена', value: trading.currentPrice },
            { label: 'Доступная цена', value: trading.availablePrice },
            { label: 'Цена за км', value: trading.pricePerKm },
            { label: 'Минимум', value: trading.min },
            { label: 'Максимум', value: trading.max },
            { label: 'Шаг ставки', value: trading.step },
            { label: 'Мой торговый статус', value: trading.statusLabel },
            {
              label: 'Моя ставка',
              value: trading.hasMyBet ? trading.myBetPrice : 'Ставка не сделана',
            },
          ]}
        />
        {!trading.canSetBet && (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Установка ставки недоступна по этому аукциону
          </p>
        )}
      </Card>

      <AuctionBets auctionUuid={auctionUuid} />
    </div>
  );
}
