import { HttpResponse, http, type RequestHandler } from 'msw';
import { API_BASE_URL } from '../client';
import type { AuctionListRequestDto, ProblemDetailDto, SetBetRequestDto } from '../dto';
import { mockStore } from './store';

const NOT_FOUND: ProblemDetailDto = {
  code: 'not_found',
  title: 'Не найдено',
  message: 'Аукцион не найден',
  trace_id: null,
};

export const handlers: RequestHandler[] = [
  http.post(`${API_BASE_URL}/auctions/list`, async ({ request }) => {
    const body = (await request.json()) as AuctionListRequestDto;

    return HttpResponse.json(mockStore.list(body));
  }),

  http.get(`${API_BASE_URL}/auctions/:auctionUuid`, ({ params }) => {
    const detail = mockStore.detail(String(params.auctionUuid));

    return detail ? HttpResponse.json(detail) : HttpResponse.json(NOT_FOUND, { status: 404 });
  }),

  http.get(`${API_BASE_URL}/auctions/:auctionUuid/bets`, ({ params }) => {
    const bets = mockStore.bets(String(params.auctionUuid));

    return bets ? HttpResponse.json(bets) : HttpResponse.json(NOT_FOUND, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
    const body = (await request.json()) as SetBetRequestDto;
    const result = mockStore.setBet(String(params.auctionUuid), body);

    if (result.kind === 'not_found') {
      return HttpResponse.json(NOT_FOUND, { status: 404 });
    }

    if (result.kind === 'validation') {
      return HttpResponse.json(result.problem, { status: 422 });
    }

    return new HttpResponse(null, { status: 200 });
  }),
];
