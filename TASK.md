# Тестовое задание: Frontend Developer

SPA для работы с грузовыми аукционами по OpenAPI-схеме.

## Контекст

Frontend-проект по готовой OpenAPI-схеме аукционов. Схема `openapi.auctions.v0.json` —
источник правды. Backend писать не нужно, вместо него MSW-моки.

Требуется точное соблюдение контрактов схемы: структуры запросов и ответов,
enum-значения, nullable-поля, ошибки, edge cases.

## Стек (обязательный)

React, TypeScript, Vite, TanStack Router, TanStack Query, React Hook Form + Zod,
MSW, Feature-Sliced Design, Zustand для точечного клиентского UI-state.

Компонентная библиотека и визуальный подход — на своё усмотрение. Интерфейс
должен быть аккуратным, адаптивным и удобным для проверки.

## API

- `POST /auctions/list` — список аукционов
- `GET /auctions/{auctionUuid}` — детальная информация
- `GET /auctions/{auctionUuid}/bets` — список ставок
- `POST /auctions/{auctionUuid}/bets` — установить ставку

MSW-моки должны соответствовать схеме и реально менять состояние после мутаций.

## Маршруты

- список аукционов
- карточка детального просмотра
- карточка установки ставки — должна открываться по ссылке

## Страница списка

- загрузка через TanStack Query
- пагинация
- skeleton, empty и error states
- prefetch детальной страницы по intent/hover
- фильтры с синхронизацией в URL search params либо в localStorage
- Zod-валидация search params с безопасными fallback-значениями
- адаптация под desktop/mobile

### Минимальный набор фильтров

`cargo_num`, `status`, `statuses`, `auc_type`, `load_city` (из мок-словаря городов),
`unload_city` (из мок-словаря городов), дата погрузки от/до, `is_available`,
`is_bidder`, цена от/до.

## Карточка аукциона в списке

- номер заявки
- тип аукциона: Request, Up, Down, FixPrice
- статус аукциона
- торговый статус пользователя: Leading, Losing, Winner и т.д.
- маршрут погрузка → выгрузка
- даты погрузки/разгрузки
- груз: название, вес, объём, тип кузова
- текущая цена, цена за км, шаг ставки
- флаг «моя ставка есть / нет»
- primary action: «Сделать ставку», «Изменить ставку», «Смотреть ставки»
  или disabled-состояние

## Детальная страница

Использует `GET /auctions/{auctionUuid}`. Показывает:

- основные данные аукциона
- организатора
- контакты, если они не скрыты
- маршрут со всеми точками
- груз и требования к ТС
- условия оплаты
- параметры торгов
- текущую цену, доступную цену, min/max/step
- состояние своей ставки
- ограничения из DTO: `can_set_bet`, `hide_bets_history`,
  `hide_points_address_and_contacts`, `no_view_cargo_price`

## Ставки

Страница или вкладка, использует `GET /auctions/{auctionUuid}/bets`. Показывает:

- список ставок
- количество участников
- цену с НДС / без НДС
- перевозчика
- место в рейтинге
- признак победителя
- признак отменённой ставки
- причину отмены, если есть
- empty state, если ставок нет
- состояние, когда история ставок скрыта через `hide_bets_history`

## Бизнес-действие: установка ставки

Форма «Сделать ставку»:

- доступность формы зависит от `trading.can_set_bet`
- React Hook Form + Zod
- цена обязательна и больше 0
- учитывать `min`, `max`, `step`, если эти поля есть в detail DTO
- подсказка по доступной цене и шагу ставки
- mutation вызывает `POST /auctions/{auctionUuid}/bets`
- после успеха инвалидируются list/detail/bets query
- MSW-store обновляет текущую цену, статус пользователя и список ставок
- success/error toast
- обработка 422 validation error

## Тесты

Минимальные тесты на чистую логику:

- парсинг search params
- request builder
- ViewModel-мапперы
- validation schema ставки

## Что сдавать

- ссылка на репозиторий
- README с запуском: что именно проверял, какие сценарии прошёл,
  какие ограничения остались
- `AI_USAGE.md`: какие части делались с AI, какие решения приняты самостоятельно,
  какие AI-предложения отклонены, какие места проверялись особенно внимательно,
  какие риски остались, что улучшил бы при наличии ещё одного дня

---

## Схема API

`openapi.auctions.v0.json` получена и лежит в корне. Это источник правды,
типы генерируются из неё. Пометки `PROVISIONAL` из кода снять.

Базовый путь: `/api/v1/`.

### Ловушки схемы

Места, где интуитивное прочтение расходится с контрактом:

**`status` и `statuses` — про разные вещи.**
- `status` — массив **строк торгового статуса пользователя** (`Leading`, `Losing`, …)
- `statuses` — массив **чисел статуса аукциона** (1–7)
- `mobile_statuses` — массив чисел торгового статуса

**В каждом enum есть `Unknown`.** UI обязан отображать его нейтрально, а не падать.
Касается `AuctionType`, `AuctionStatus`, `TradingStatus`, `BidMeasurementType`,
`OperationType`, `PaymentDelayType`.

**Тип аукциона называется `AuctionType`,** не `AucType`.

**Фильтры лежат плоско** в корне `AuctionListRequest`, без обёртки. `per_page`, не `limit`.

**Пагинация:** ответ `{ data, meta }`, meta = `current_page`, `from`, `to`,
`per_page`, `last_page`, `total`.

**Вложенность элемента списка:** `main`, `organizer`, `route`, `cargo`, `trading`,
`payment`. Цены в `trading.price`, своя ставка в `trading.your`,
`price_per_km` — в `main`.

**Объекта `restrictions` не существует.** Флаги `no_view_cargo_price`,
`hide_points_address_and_contacts`, `hide_bets_history`, `hide_places` —
внутри `trading`. `hide_bets_history` дублируется на верхнем уровне
`AuctionShowResponse`.

**`min`/`max`/`step`/`available` — в `trading.price`,** у каждого двойник `_no_vat`.

**Поля ставки:** `is_rejected` (не `is_cancelled`), `is_win` (не `is_winner`),
`place` (не `rank`), `price_no_vat`. Организация перевозчика — плоские поля
`organization_name`, `organization_inn`, `contact_name`, `contact_phone`.
Ответ — `{ bets: [...] }`.

**`SetBetRequest = { price }`** и всё.

**У `POST /auctions/{auctionUuid}/bets` нет схемы ответа** — проксируется от
upstream. Значит после успеха инвалидировать и перечитывать, а не доверять телу.

**Формат 422:**
`{ code: "validation_failed", title, message, trace_id?, errors: [{ field, message, code? }] }`
где `field` — путь через точку в snake_case.

**Коды ответов:** 401 и 503 есть на всех эндпоинтах.

### Расхождения с формулировками ТЗ

- «цена от/до» → `current_price_from` / `current_price_to`
  (плюс отдельно `price_per_km_from` / `price_per_km_to`)
- «мок-словарь городов» → эндпоинта справочника в схеме нет, словарь свой.
  Рядом с `load_city` (строка) есть `load_gc_id` (число) и `load_range`
- «количество участников» → `participants_count` в схеме отсутствует,
  выводить по уникальным `organization_id`

## Конвенции проекта

- именование компонентов: `PascalCase.tsx`, один компонент на файл
- типы DTO — только сгенерированные из OpenAPI-схемы, руками не писать
- строковые enum-значения — только в `shared/api`, в UI импорт по имени,
  строковых литералов в компонентах нет
- компоненты работают с ViewModel, не с DTO напрямую; маппинг в `entities`
- комментарии не писать, кроме обоснования решений, не следующих из схемы
- не добавлять функциональность, о которой не просили
- коммитить после каждого завершённого шага, ветку не менять без спроса
- Windows PowerShell 5.1: `&&` не работает, использовать `npm run check`