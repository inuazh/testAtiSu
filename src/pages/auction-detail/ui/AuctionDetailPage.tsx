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
  const { trading, restrictions, organizer, cargo, payment, primaryAction } = auction;
  const goesToBid =
    primaryAction.kind === PRIMARY_ACTION.CreateBet ||
    primaryAction.kind === PRIMARY_ACTION.EditBet;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/auctions" className="text-xs text-slate-500 hover:underline">
            ← К списку аукционов
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{auction.cargoNum}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={trading.auctionStatusTone}>{trading.auctionStatusLabel}</Badge>
            <Badge variant="info">{auction.aucTypeLabel}</Badge>
            <Badge variant={trading.statusTone}>{trading.statusLabel}</Badge>
          </div>
        </div>

        {goesToBid ? (
          <Link to="/auctions/$auctionUuid/bid" params={{ auctionUuid }}>
            <Button>{primaryAction.label}</Button>
          </Link>
        ) : (
          <Button disabled={primaryAction.disabled}>{primaryAction.label}</Button>
        )}
      </header>

      <Card title="Основные данные">
        <DataList
          rows={[
            { label: 'Номер заявки', value: auction.cargoNum },
            { label: 'Дата заявки', value: auction.cargoDate },
            { label: 'Тип аукциона', value: auction.aucTypeLabel },
            { label: 'Статус аукциона', value: trading.auctionStatusLabel },
            { label: 'Создан', value: auction.createdAt },
            { label: 'Сборный рейс', value: auction.assemblyNum },
          ]}
        />
      </Card>

      <Card title="Организатор">
        <DataList
          rows={[
            { label: 'Название', value: organizer.name },
            { label: 'ИНН', value: organizer.inn },
            { label: 'КПП', value: organizer.kpp },
            { label: 'Код абонента', value: organizer.subscriberCode },
          ]}
        />
        {auction.contactsHidden ? (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Контакты скрыты организатором
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1">
            {auction.contacts.map((contact) => (
              <li key={contact.key} className="text-sm text-slate-700">
                {contact.name} · {contact.phone} · {contact.email}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Маршрут">
        {restrictions.hidePointsAddressAndContacts && (
          <p className="mb-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Адреса точек и контакты скрыты организатором
          </p>
        )}
        <ol className="flex flex-col gap-3">
          {auction.points.map((point) => (
            <li key={point.key} className="border-l-2 border-slate-200 pl-3">
              <p className="text-xs text-slate-500">{point.opTypeLabel}</p>
              <p className="text-sm font-medium text-slate-900">{point.cityFullName}</p>
              <p className="text-xs text-slate-500">{point.address}</p>
              <p className="text-xs text-slate-500">
                {point.startDate} — {point.endDate}
              </p>
              <p className="text-xs text-slate-500">
                {point.cargoName} · {point.packageName} · {point.weight} т · {point.volume} м³
              </p>
              <p className="text-xs text-slate-500">
                {point.contactName} · {point.contactPhone}
              </p>
              {point.comment !== '—' && (
                <p className="text-xs text-slate-500">Комментарий: {point.comment}</p>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Груз и требования к ТС">
        <DataList
          rows={[
            {
              label: 'Стоимость груза',
              value: cargo.priceHidden ? 'Скрыта организатором' : cargo.price,
            },
            { label: 'Тип кузова', value: cargo.bodyType },
            { label: 'Количество машин', value: cargo.truckCount },
            { label: 'Расстояние', value: cargo.distance },
            { label: 'Температурный режим', value: cargo.temperature },
            { label: 'Типы погрузки', value: cargo.loadingTypes },
            { label: 'Документы', value: cargo.docs },
            { label: 'Требуемое ТС', value: cargo.carType },
            { label: 'Вместимость ТС', value: cargo.carCapacity },
            { label: 'Международная перевозка', value: cargo.isInternational ? 'Да' : 'Нет' },
            { label: 'Контейнер', value: cargo.containered ? 'Да' : 'Нет' },
          ]}
        />
      </Card>

      <Card title="Условия оплаты">
        <DataList
          rows={[
            { label: 'Форма оплаты', value: payment.form },
            { label: 'Условие', value: payment.condition },
            { label: 'Отсрочка', value: payment.delay },
            { label: 'Валюта', value: payment.currencyCode },
            { label: 'Предоплата', value: payment.prepay },
          ]}
        />
      </Card>

      <Card title="Параметры торгов">
        <DataList
          rows={[
            { label: 'Текущая цена', value: trading.currentPrice.withVat },
            { label: 'Текущая цена без НДС', value: trading.currentPrice.noVat },
            { label: 'Доступная цена', value: trading.availablePrice.withVat },
            { label: 'Доступная цена без НДС', value: trading.availablePrice.noVat },
            { label: 'Минимум', value: trading.minPrice.withVat },
            { label: 'Максимум', value: trading.maxPrice.withVat },
            { label: 'Шаг ставки', value: trading.step.withVat },
            { label: 'Цена за км', value: trading.pricePerKm },
            { label: 'Единица измерения ставки', value: trading.bidMeasurementLabel },
            { label: 'Начало торгов', value: trading.startTime },
            { label: 'Окончание торгов', value: trading.stopTime },
            { label: 'Мой торговый статус', value: trading.statusLabel },
            {
              label: 'Моя ставка',
              value: trading.hasMyBet ? trading.myBetWithVat : 'Ставка не сделана',
            },
          ]}
        />
        {!trading.canSetBet && (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Установка ставки недоступна по этому аукциону
          </p>
        )}
      </Card>

      <AuctionBets auction={auction} />
    </div>
  );
}
