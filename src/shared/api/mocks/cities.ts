import type { CityDto } from '../dto';

export const MOCK_CITIES: readonly CityDto[] = [
  { id: 'msk', name: 'Москва', region: 'Московская область' },
  { id: 'spb', name: 'Санкт-Петербург', region: 'Ленинградская область' },
  { id: 'nsk', name: 'Новосибирск', region: 'Новосибирская область' },
  { id: 'ekb', name: 'Екатеринбург', region: 'Свердловская область' },
  { id: 'knd', name: 'Краснодар', region: 'Краснодарский край' },
  { id: 'kzn', name: 'Казань', region: 'Республика Татарстан' },
  { id: 'nng', name: 'Нижний Новгород', region: 'Нижегородская область' },
  { id: 'smr', name: 'Самара', region: 'Самарская область' },
  { id: 'rnd', name: 'Ростов-на-Дону', region: 'Ростовская область' },
  { id: 'vrn', name: 'Воронеж', region: 'Воронежская область' },
  { id: 'prm', name: 'Пермь', region: 'Пермский край' },
  { id: 'vlg', name: 'Волгоград', region: 'Волгоградская область' },
];

export function findCity(cityId: string): CityDto | undefined {
  return MOCK_CITIES.find((city) => city.id === cityId);
}
