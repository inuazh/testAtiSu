import { createFileRoute } from '@tanstack/react-router';
import { AuctionsListPage } from '@/pages/auctions-list';

export const Route = createFileRoute('/auctions/')({
  component: AuctionsListPage,
});
