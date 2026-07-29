import { render, screen } from '@testing-library/react';
import { beforeAll, expect, test } from 'vitest';
import { mockStore } from '@/shared/api/mocks/store';
import { App } from './App';
import { router } from './providers/router';

let auctionUuid = '';
let cargoNum = '';

beforeAll(() => {
  const first = mockStore.list({ page: 1, limit: 1 }).items[0];

  if (first === undefined) {
    throw new Error('Мок-стор не отдал ни одного аукциона');
  }

  auctionUuid = first.uuid;
  cargoNum = first.cargo_num;
});

test('список аукционов отдаёт карточки', async () => {
  await router.navigate({ to: '/auctions' });
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Аукционы' })).toBeInTheDocument();
  expect(await screen.findAllByText(cargoNum)).not.toHaveLength(0);
});

test('детальная страница показывает номер заявки', async () => {
  await router.navigate({ to: '/auctions/$auctionUuid', params: { auctionUuid } });
  render(<App />);

  expect(await screen.findByRole('heading', { name: cargoNum })).toBeInTheDocument();
});

test('страница ставки открывается по прямой ссылке', async () => {
  await router.navigate({ to: '/auctions/$auctionUuid/bid', params: { auctionUuid } });
  render(<App />);

  expect(
    await screen.findByRole('heading', { name: `Ставка по заявке ${cargoNum}` }),
  ).toBeInTheDocument();
});
