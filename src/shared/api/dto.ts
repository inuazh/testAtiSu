import type { components } from './schema';

type Schemas = components['schemas'];

export type AucTypeDto = Schemas['AucType'];
export type AuctionStatusDto = Schemas['AuctionStatus'];
export type TradingStatusDto = Schemas['TradingStatus'];
export type BodyTypeDto = Schemas['BodyType'];
export type RoutePointKindDto = Schemas['RoutePoint']['kind'];

export type CityDto = Schemas['City'];
export type RoutePointDto = Schemas['RoutePoint'];
export type CargoDto = Schemas['Cargo'];
export type TradingDto = Schemas['Trading'];
export type OrganizerDto = Schemas['Organizer'];
export type ContactDto = Schemas['Contact'];
export type VehicleRequirementsDto = Schemas['VehicleRequirements'];
export type PaymentConditionsDto = Schemas['PaymentConditions'];
export type RestrictionsDto = Schemas['Restrictions'];
export type CarrierDto = Schemas['Carrier'];

export type AuctionListRequestDto = Schemas['AuctionListRequest'];
export type AuctionListFiltersDto = Schemas['AuctionListFilters'];
export type AuctionListResponseDto = Schemas['AuctionListResponse'];
export type AuctionListItemDto = Schemas['AuctionListItem'];
export type AuctionDetailDto = Schemas['AuctionDetail'];

export type BetDto = Schemas['Bet'];
export type BetsResponseDto = Schemas['BetsResponse'];
export type CreateBetRequestDto = Schemas['CreateBetRequest'];
export type CreateBetResponseDto = Schemas['CreateBetResponse'];

export type ErrorDto = Schemas['Error'];
export type ValidationErrorItemDto = Schemas['ValidationErrorItem'];
export type ValidationErrorResponseDto = Schemas['ValidationErrorResponse'];
