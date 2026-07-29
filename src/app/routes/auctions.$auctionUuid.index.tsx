import { createFileRoute } from '@tanstack/react-router';
import { AuctionDetailPage } from '@/pages/auction-detail';

export const Route = createFileRoute('/auctions/$auctionUuid/')({
  component: AuctionDetailPage,
});
