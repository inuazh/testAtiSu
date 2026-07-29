import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';
import { router } from './providers/router';

test.each([
  ['/auctions', 'Список аукционов'],
  ['/auctions/abc', 'Аукцион abc'],
  ['/auctions/abc/bid', 'Ставка по аукциону abc'],
])('монтирует %s', async (path, heading) => {
  await router.navigate({ to: path });
  render(<App />);

  expect(await screen.findByText(heading)).toBeInTheDocument();
});
