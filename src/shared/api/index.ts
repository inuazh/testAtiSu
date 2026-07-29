export { API_BASE_URL, ApiError, getErrorMessage, getValidationDetail } from './client';
export type * from './dto';
export { createBet, getAuctionBets, getAuctionDetail, getAuctionsList } from './endpoints';
export {
  AUC_TYPE,
  AUC_TYPE_VALUES,
  AUCTION_STATUS,
  AUCTION_STATUS_VALUES,
  BODY_TYPE,
  BODY_TYPE_VALUES,
  ROUTE_POINT_KIND,
  TRADING_STATUS,
  TRADING_STATUS_VALUES,
} from './enums';
// PROVISIONAL: в схеме нет эндпоинта справочника городов, фильтры берут словарь из мок-слоя
export { MOCK_CITIES } from './mocks/cities';
export { auctionKeys } from './queryKeys';
