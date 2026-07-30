import type { components } from './schema';

type Schemas = components['schemas'];

export type AuctionTypeDto = Schemas['AuctionType'];
export type AuctionStatusDto = Schemas['AuctionStatus'];
export type TradingStatusDto = Schemas['TradingStatus'];
export type BidMeasurementTypeDto = Schemas['BidMeasurementType'];
export type OperationTypeDto = Schemas['OperationType'];
export type PaymentDelayTypeDto = Schemas['PaymentDelayType'];

export type AuctionListRequestDto = Schemas['AuctionListRequest'];
export type AuctionListResponseDto = Schemas['AuctionListResponseBase'];
export type AuctionListMetaDto = Schemas['AuctionListMeta'];
export type AuctionListItemDto = Schemas['AuctionListItem'];
export type AuctionListItemMainDto = Schemas['AuctionListItemMain'];
export type AuctionListItemOrganizerDto = Schemas['AuctionListItemOrganizer'];
export type AuctionListItemRouteDto = Schemas['AuctionListItemRoute'];
export type AuctionListItemRoutePointDto = Schemas['AuctionListItemRoutePoint'];
export type AuctionListItemCargoDto = Schemas['AuctionListItemCargo'];
export type AuctionListItemTradingDto = Schemas['AuctionListItemTrading'];
export type AuctionListItemTradingPriceDto = Schemas['AuctionListItemTradingPrice'];
export type AuctionListItemTradingYourDto = Schemas['AuctionListItemTradingYour'];
export type AuctionListItemPaymentDto = Schemas['AuctionListItemPayment'];

export type AuctionShowResponseDto = Schemas['AuctionShowResponse'];
export type AuctionShowMainDto = Schemas['AuctionShowMain'];
export type AuctionShowOrganizerDto = Schemas['AuctionShowOrganizer'];
export type AuctionShowCargoDto = Schemas['AuctionShowCargo'];
export type AuctionShowTradingDto = Schemas['AuctionShowTrading'];
export type AuctionShowTradingPriceDto = Schemas['AuctionShowTradingPrice'];
export type AuctionShowTradingYourDto = Schemas['AuctionShowTradingYour'];
export type AuctionShowTradingSettingsDto = Schemas['AuctionShowTradingSettings'];
export type AuctionShowPaymentDto = Schemas['AuctionShowPayment'];

export type RoutePointDto = Schemas['RoutePoint'];
export type RoutePointLocationDto = Schemas['RoutePointLocation'];
export type RoutePointCargoDto = Schemas['RoutePointCargo'];
export type RoutePointContactDto = Schemas['RoutePointContact'];
export type ContactDto = Schemas['Contact'];
export type AssemblyDto = Schemas['Assembly'];
export type AdmittedOrganizationDto = Schemas['AdmittedOrganization'];
export type CarRequirementsDto = Schemas['CarRequirements'];
export type DocsDto = Schemas['Docs'];
export type LoadingTypesDto = Schemas['LoadingTypes'];

export type BetListResponseDto = Schemas['BetListResponse'];
export type BetItemDto = Schemas['BetItem'];
export type BetItemPriceInfoDto = Schemas['BetItemPriceInfo'];
export type SetBetRequestDto = Schemas['SetBetRequest'];

export type ProblemDetailDto = Schemas['ProblemDetail'];
export type ValidationProblemDto = Schemas['ValidationProblem'];
export type ValidationErrorDto = Schemas['ValidationError'];
