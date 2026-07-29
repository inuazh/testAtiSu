import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, expect, test } from 'vitest';
import { mapAuctionDetail } from '@/entities/auction';
import { API_BASE_URL } from '@/shared/api';
import { server } from '@/shared/api/mocks/server';
import { mockStore } from '@/shared/api/mocks/store';
import { Toaster, useToastStore } from '@/shared/ui';
import { CreateBetForm } from './CreateBetForm';

afterEach(() => {
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
    .list({ page: 1, limit: 100 })
    .items.find((candidate) => candidate.trading.can_set_bet);

  if (item === undefined) {
    throw new Error('В моках нет аукциона, доступного для ставки');
  }

  const detail = mockStore.detail(item.uuid);

  if (detail === undefined) {
    throw new Error('Мок-стор не отдал детальную карточку');
  }

  return mapAuctionDetail(detail);
}

test('серверная 422 показывается как ошибка поля price', async () => {
  const auction = firstBiddableAuction();

  server.use(
    http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, () =>
      HttpResponse.json(
        {
          detail: [
            { loc: ['body', 'price'], msg: 'Ставка уже перебита', type: 'value_error.outdated' },
          ],
        },
        { status: 422 },
      ),
    ),
  );

  renderWithQuery(<CreateBetForm auction={auction} onDone={() => {}} />);

  await userEvent.click(screen.getByRole('button', { name: 'Отправить ставку' }));

  expect(await screen.findByText('Ставка уже перебита')).toBeInTheDocument();
});

test('ошибка без привязки к полю уходит в тост', async () => {
  const auction = firstBiddableAuction();

  server.use(
    http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, () =>
      HttpResponse.json(
        { code: 'bets_not_allowed', message: 'Ставки по этому аукциону недоступны' },
        { status: 403 },
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

test('форма не рендерится, когда can_set_bet выключен', () => {
  const auction = firstBiddableAuction();
  const blocked = {
    ...auction,
    trading: { ...auction.trading, canSetBet: false },
  };

  renderWithQuery(<CreateBetForm auction={blocked} onDone={() => {}} />);

  expect(screen.getByText('Ставки по этому аукциону недоступны.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Отправить ставку' })).not.toBeInTheDocument();
});
