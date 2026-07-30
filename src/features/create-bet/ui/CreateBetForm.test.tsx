import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { mapAuctionDetail } from '@/entities/auction';
import { API_BASE_URL } from '@/shared/api';
import { server } from '@/shared/api/mocks/server';
import { mockStore } from '@/shared/api/mocks/store';
import { Toaster, useToastStore } from '@/shared/ui';
import { CreateBetForm } from './CreateBetForm';

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
});

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function firstBiddableAuction() {
  const item = mockStore
    .list({ page: 1, per_page: 100 })
    .data?.find((candidate) => candidate.trading?.can_set_bet === true);

  const uuid = item?.main?.order_uid;

  if (uuid === undefined) {
    throw new Error('В моках нет аукциона, доступного для ставки');
  }

  const detail = mockStore.detail(uuid);

  if (detail === undefined) {
    throw new Error('Мок-стор не отдал карточку аукциона');
  }

  return mapAuctionDetail(detail, uuid);
}

test('422 с dotted-полем price показывается под полем', async () => {
  const auction = firstBiddableAuction();

  server.use(
    http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, () =>
      HttpResponse.json(
        {
          code: 'validation_failed',
          title: 'Ошибка валидации',
          message: 'Проверьте поля',
          trace_id: 'trace-1',
          errors: [{ field: 'bet.price', message: 'Ставка уже перебита', code: 'outdated' }],
        },
        { status: 422 },
      ),
    ),
  );

  renderWithQuery(<CreateBetForm auction={auction} onDone={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: 'Отправить ставку' }));

  expect(await screen.findByText('Ставка уже перебита')).toBeInTheDocument();
});

test('422 с полем не из формы уходит в тост', async () => {
  const auction = firstBiddableAuction();

  server.use(
    http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, () =>
      HttpResponse.json(
        {
          code: 'validation_failed',
          title: 'Ошибка валидации',
          message: 'Проверьте поля',
          trace_id: null,
          errors: [
            {
              field: 'trading.can_set_bet',
              message: 'Ставки по этому аукциону недоступны',
              code: 'bets_not_allowed',
            },
          ],
        },
        { status: 422 },
      ),
    ),
  );

  renderWithQuery(
    <>
      <CreateBetForm auction={auction} onDone={() => {}} />
      <Toaster />
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Отправить ставку' }));

  expect(await screen.findByText('Ставки по этому аукциону недоступны')).toBeInTheDocument();
});

test('401 показывает сообщение про истёкшую сессию', async () => {
  const auction = firstBiddableAuction();

  server.use(
    http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, () =>
      HttpResponse.json(
        { code: 'unauthorized', title: 'Не авторизован', message: 'Bearer-токен недействителен' },
        { status: 401 },
      ),
    ),
  );

  renderWithQuery(
    <>
      <CreateBetForm auction={auction} onDone={() => {}} />
      <Toaster />
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Отправить ставку' }));

  expect(await screen.findByText(/Сессия истекла/)).toBeInTheDocument();
});

test('503 показывает сообщение про недоступность сервиса', async () => {
  const auction = firstBiddableAuction();

  server.use(
    http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, () =>
      HttpResponse.json(
        { code: 'service_unavailable', title: 'Недоступен', message: 'upstream is down' },
        { status: 503 },
      ),
    ),
  );

  renderWithQuery(
    <>
      <CreateBetForm auction={auction} onDone={() => {}} />
      <Toaster />
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Отправить ставку' }));

  expect(await screen.findByText(/Сервис временно недоступен/)).toBeInTheDocument();
});

test('форма не рендерится, когда can_set_bet выключен', () => {
  const auction = firstBiddableAuction();

  renderWithQuery(
    <CreateBetForm
      auction={{ ...auction, trading: { ...auction.trading, canSetBet: false } }}
      onDone={() => {}}
    />,
  );

  expect(screen.getByText('Ставки по этому аукциону недоступны.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Отправить ставку' })).not.toBeInTheDocument();
});
