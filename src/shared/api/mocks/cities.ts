export interface MockCity {
  gcId: number;
  name: string;
  fullName: string;
}

export const MOCK_CITIES: readonly MockCity[] = [
  { gcId: 100, name: 'Москва', fullName: 'Москва, Московская обл.' },
  { gcId: 200, name: 'Санкт-Петербург', fullName: 'Санкт-Петербург, Ленинградская обл.' },
  { gcId: 300, name: 'Новосибирск', fullName: 'Новосибирск, Новосибирская обл.' },
  { gcId: 400, name: 'Екатеринбург', fullName: 'Екатеринбург, Свердловская обл.' },
  { gcId: 500, name: 'Краснодар', fullName: 'Краснодар, Краснодарский край' },
  { gcId: 600, name: 'Казань', fullName: 'Казань, Республика Татарстан' },
  { gcId: 700, name: 'Нижний Новгород', fullName: 'Нижний Новгород, Нижегородская обл.' },
  { gcId: 800, name: 'Самара', fullName: 'Самара, Самарская обл.' },
  { gcId: 900, name: 'Ростов-на-Дону', fullName: 'Ростов-на-Дону, Ростовская обл.' },
  { gcId: 1000, name: 'Воронеж', fullName: 'Воронеж, Воронежская обл.' },
  { gcId: 1100, name: 'Пермь', fullName: 'Пермь, Пермский край' },
  { gcId: 1200, name: 'Волгоград', fullName: 'Волгоград, Волгоградская обл.' },
];
