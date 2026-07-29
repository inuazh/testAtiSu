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

Воркер (`public/mockServiceWorker.js`) поднимается и в dev, и в production-сборке —
бэкенда нет, моки нужны везде. Приложение рендерится только после того, как
`worker.start()` зарезолвится. Необработанные запросы пропускаются на реальную сеть
(`onUnhandledRequest: 'bypass'`). Хендлеры добавляются в
`src/shared/api/mocks/handlers.ts` после получения схемы.

Раз воркер нужен в проде, `msw` лежит в `dependencies`, а не в `devDependencies`, и
уезжает в отдельный чанк (~404 kB / 152 kB gzip). Service Worker браузер разрешает
только на `localhost` или по HTTPS — при деплое на HTTP-хост моки не поднимутся.

## Версии

Все зависимости зафиксированы точно, без `^`; `.npmrc` с `save-exact=true`, чтобы
новые установки не размывали пины. `package-lock.json` в репозитории.
Требуется Node `>=22.12.0` (`engines.node`).

## Что проверено

- `npm run dev` — сервер стартует, все четыре маршрута отдают приложение,
  `mockServiceWorker.js` доступен
- `npm run build && npm run preview` — в headless-браузере на production-сборке
  страница рендерится, в консоли `[MSW] Mocking enabled.`,
  `navigator.serviceWorker.controller` не пустой; проверены `/auctions` и
  `/auctions/abc/bid`
- `npm test` — 3 теста: монтирование всех трёх страниц, `auctionUuid` прокидывается
- `npm run lint` — без замечаний
- `npx openapi-typescript` отрабатывает на TypeScript 7: сгенерированные типы
  проходят `tsc -b` под текущим strict-конфигом, enum-значения из схемы реально
  сужаются до литералов

## Ограничения

- нет DTO, типов, фикстур и MSW-хендлеров — ждём `openapi.auctions.v0.json`
- слои `widgets`, `features`, `entities` и сегменты `shared/lib`, `shared/ui` пустые
- нет favicon — в консоли 404 на `/favicon.ico`
