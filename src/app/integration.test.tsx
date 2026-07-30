import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { AuctionListRequestDto } from '@/shared/api';
import { AUCTION_TYPE } from '@/shared/api';
import { server } from '@/shared/api/mocks/server';
import { mockStore } from '@/shared/api/mocks/store';
import { formatPrice } from '@/shared/lib';
import { Toaster, useToastStore } from '@/shared/ui';
import { createQueryClient } from './providers/queryClient';
import { routeTree } from './routeTree.gen';

const listRequests: AuctionListRequestDto[] = [];

beforeEach(() => {
  listRequests.length = 0;
  useToastStore.setState({ toasts: [] });

  server.events.on('request:start', ({ request }) => {
    if (request.method === 'POST' && request.url.endsWith('/auctions/list')) {
      void request
        .clone()
        .json()
        .then((body) => {
          listRequests.push(body as AuctionListRequestDto);
        });
    }
  });
});

afterEach(() => {
  server.events.removeAllListeners();
});

function renderApp(initialUrl: string) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
    mutations: { retry: false },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>,
  );

  return { router, queryClient };
}

function normalize(value: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ');
}

function lastListRequest(): AuctionListRequestDto {
  const request = listRequests[listRequests.length - 1];

  if (request === undefined) {
    throw new Error('Список ни разу не запрашивался');
  }

  return request;
}

async function cards() {
  return screen.findAllByRole('article');
}

describe('фильтры через реальный роутер', () => {
  test('клик по чекбоксу пишет фильтр в URL и перезапрашивает список', async () => {
    const { router } = renderApp('/auctions');

    await cards();
    await waitFor(() => expect(listRequests).toHaveLength(1));
    expect(lastListRequest().auc_type).toBeUndefined();

    const group = screen.getByRole('group', { name: 'Тип аукциона' });
    await userEvent.click(within(group).getByRole('checkbox', { name: 'На понижение' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ auc_type: [AUCTION_TYPE.Down] });
    });

    await waitFor(() => {
      expect(lastListRequest().auc_type).toEqual([AUCTION_TYPE.Down]);
    });

    expect(listRequests.length).toBeGreaterThan(1);
    expect(lastListRequest().page).toBe(1);

    const rendered = await cards();
    for (const card of rendered) {
      expect(card).toHaveTextContent('На понижение');
    }
  });

  test('битые search params не роняют страницу, остальные фильтры применяются', async () => {
    renderApp('/auctions?page=abc&statuses=99&auc_type=Down');

    const rendered = await cards();
    expect(rendered.length).toBeGreaterThan(0);

    await waitFor(() => expect(listRequests).toHaveLength(1));

    const request = lastListRequest();
    expect(request.page).toBe(1);
    expect(request.statuses).toBeUndefined();
    expect(request.auc_type).toEqual([AUCTION_TYPE.Down]);

    for (const card of rendered) {
      expect(card).toHaveTextContent('На понижение');
    }

    const group = screen.getByRole('group', { name: 'Тип аукциона' });
    expect(within(group).getByRole('checkbox', { name: 'На понижение' })).toBeChecked();
  });

  test('фильтр без совпадений показывает empty state, а не вечный скелетон', async () => {
    renderApp('/auctions?cargo_num=НЕТ-ТАКОГО-НОМЕРА');

    expect(await screen.findByText('Аукционы не найдены')).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);

    await waitFor(() => {
      expect(document.body.querySelectorAll('.animate-pulse')).toHaveLength(0);
    });

    expect(screen.getByRole('button', { name: 'Сбросить фильтры' })).toBeInTheDocument();
  });
});

describe('ставка обновляет список', () => {
  function pickBiddableAuction() {
    for (const item of mockStore.list({ page: 1, per_page: 100 }).data ?? []) {
      const uuid = item.main?.order_uid;
      const cargoNum = item.main?.cargo_num;

      if (uuid === undefined || cargoNum === undefined) {
        continue;
      }

      if (item.main?.auc_type !== AUCTION_TYPE.Down || item.trading?.can_set_bet !== true) {
        continue;
      }

      if (item.trading.your?.bet === true) {
        continue;
      }

      const price = mockStore.detail(uuid)?.trading?.price;
      const available = price?.available;
      const current = price?.current;

      if (available == null || current == null || !((price?.step ?? 0) > 0)) {
        continue;
      }

      return { uuid, cargoNum, current, available };
    }

    throw new Error('В моках нет Down-аукциона, доступного для ставки');
  }

  test('после отправки формы список показывает новую цену и торговый статус', async () => {
    const auction = pickBiddableAuction();
    const { router } = renderApp(`/auctions?cargo_num=${auction.cargoNum}`);

    const [before] = await cards();
    expect(before).toBeDefined();
    expect(normalize(before?.textContent ?? '')).toContain(normalize(formatPrice(auction.current)));
    expect(before).toHaveTextContent('Не участвую');
    expect(before).toHaveTextContent('Своей ставки нет');

    const requestsBeforeBet = listRequests.length;

    await router.navigate({
      to: '/auctions/$auctionUuid/bid',
      params: { auctionUuid: auction.uuid },
    });

    const priceInput = await screen.findByLabelText(/Цена ставки/);
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, String(auction.available));
    await userEvent.click(screen.getByRole('button', { name: 'Отправить ставку' }));

    expect(await screen.findByText('Ставка принята')).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/auctions/${auction.uuid}`);
    });

    await router.navigate({ to: '/auctions', search: { cargo_num: auction.cargoNum } });

    const [after] = await cards();
    expect(after).toBeDefined();

    await waitFor(() => {
      expect(normalize(after?.textContent ?? '')).toContain(
        normalize(formatPrice(auction.available)),
      );
    });

    expect(after).toHaveTextContent('Лидирую');
    expect(after).toHaveTextContent('Моя ставка есть');
    expect(after).toHaveTextContent('Изменить ставку');
    expect(normalize(after?.textContent ?? '')).not.toContain(
      normalize(formatPrice(auction.current)),
    );

    expect(listRequests.length).toBeGreaterThan(requestsBeforeBet);
  });
});
