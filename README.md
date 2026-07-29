# Грузовые аукционы — SPA

Каркас проекта по [TASK.md](TASK.md). Бизнес-логика ещё не реализована: OpenAPI-схема
`openapi.auctions.v0.json` не получена, поэтому DTO, типы, фикстуры и MSW-хендлеры
намеренно пустые.

## Команды

| Команда            | Что делает                                        |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Dev-сервер Vite, MSW стартует автоматически        |
| `npm run build`    | Проверка типов (`tsc -b`) и production-сборка      |
| `npm run preview`  | Просмотр production-сборки                         |
| `npm run typecheck`| Только проверка типов                              |
| `npm run lint`     | Biome: линт + формат (проверка)                    |
| `npm run lint:fix` | Biome: линт + формат с автоисправлением            |
| `npm run format`   | Biome: только форматирование                       |
| `npm test`         | Vitest, один прогон                                |
| `npm run test:watch` | Vitest в watch-режиме                            |

## Стек

Vite 8, React 19, TypeScript 7 (strict), TanStack Router (file-based) + TanStack Query v5,
Zustand v5, React Hook Form + Zod v4, MSW, Tailwind v4, Biome, Vitest + Testing Library.

## Структура

Feature-Sliced Design, алиас `@/` → `src/`.

```
src/
  app/        точка сборки: провайдеры, роуты, стили
    routes/   file-based роуты TanStack Router
  pages/      auctions-list, auction-detail, auction-bid
  widgets/    пусто
  features/   пусто
  entities/   пусто
  shared/
    api/mocks/  MSW: worker, пустой список хендлеров
    config/test/ setup для Vitest
    lib/        пусто
    ui/         пусто
```

`src/app/routeTree.gen.ts` генерируется плагином TanStack Router при `dev` и `build`.

## Маршруты

- `/` → редирект на `/auctions`
- `/auctions` — список
- `/auctions/$auctionUuid` — детальная карточка
- `/auctions/$auctionUuid/bid` — установка ставки

Все три — заглушки.

## MSW

Воркер (`public/mockServiceWorker.js`) поднимается только в dev, необработанные запросы
пропускаются на реальную сеть (`onUnhandledRequest: 'bypass'`). Хендлеры добавляются в
`src/shared/api/mocks/handlers.ts` после получения схемы.

## Что проверено

- `npm run dev` — сервер стартует, все четыре маршрута отдают приложение,
  `mockServiceWorker.js` доступен
- страницы всех трёх маршрутов монтируются, параметр `auctionUuid` прокидывается
- `npm run build` — типы и сборка проходят
- `npm run lint` — без замечаний

## Ограничения

- нет DTO, типов, фикстур и MSW-хендлеров — ждём `openapi.auctions.v0.json`
- слои `widgets`, `features`, `entities` и сегменты `shared/lib`, `shared/ui` пустые
- тестов нет: тестировать пока нечего, `passWithNoTests` включён
