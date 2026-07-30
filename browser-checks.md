# Браузерные прогоны

Проверки гонялись скриптами на Chrome DevTools Protocol против production-сборки
(`npm run build` + `vite preview`) в headless Chrome. Скрипты одноразовые, после
каждого прогона удалялись; вывод здесь выгружен дословно из транскрипта сессии.

Строки вида `NNNpx: [{...}]` — это дампы замеров, их переносил по ширине сам
консольный вывод PowerShell.

---

## 1. Переход на настоящую схему API — 38 проверок

Список, пагинация, `status` против `statuses`, детальная карточка, форма ставки,
мутация мок-стора, ограничения из `trading`, 404, мобильная вёрстка.

### Первый прогон: 1 провал

Провалилось `statuses из URL применён к UI`: одиночное числовое значение
(`?statuses=2`) роутер отдаёт числом, а схема ждала массив или строку, поэтому
фильтр молча откатывался в `undefined`.

```
PASS  список рендерится
PASS  MSW на /api/v1 отвечает
PASS  MSW включён
PASS  ответ списка = { data, meta } — {"current_page":1,"from":1,"last_page":3,"per_page":20,"to":20,"total":44}
PASS  meta = current_page/last_page/per_page/total
PASS  пагинация пишет page и per_page — ?page=3&per_page=20
PASS  последняя страница = остаток
PASS  status фильтрует по торговому статусу пользователя — n=4
PASS  statuses фильтрует по статусу аукциона (код 2 = Auction) — n=18
PASS  status и statuses дают разные выборки — 4 vs 18
FAIL  statuses из URL применён к UI
PASS  status из URL применён к UI
PASS  фильтры auc_type + load_city применены
PASS  битые search params → fallback
PASS  empty state
PASS  нашёлся Down-аукцион со ставкой — {"uuid":"e38d6269-3a7c-4b63-844a-716af43d556d","current":142000,"available":139500,"step":2500,"min":75000}
PASS  детальная: все блоки
PASS  показаны цены с НДС и без
PASS  форма открывается по прямой ссылке
PASS  нет чекбокса НДС — SetBetRequest только price
PASS  цена предзаполнена доступной
PASS  цена выше максимума отклонена
PASS  некратная шагу цена отклонена
PASS  форма осталась на месте при ошибках
PASS  после успеха ушли на карточку
PASS  тост об успехе
PASS  мок-store изменил цену — 142 000 ₽ → 139 500 ₽
PASS  торговый статус пересчитан — Не участвую → Лидирую
PASS  ставка видна в списке ставок
PASS  инвалидация докатилась до списка
PASS  hide_bets_history
PASS  hide_places
PASS  hide_points_address_and_contacts
PASS  no_view_cargo_price
PASS  Unknown показан нейтрально, страница жива
PASS  404 → error state
PASS  404 от API
PASS  нет горизонтального скролла на 390px — overflow=0px

--- console errors ---
[error] ApiError: GET /auctions/00000000-0000-4000-8000-000000000000 → 404
    at d (http://127.0.0.1:5200/assets/enums-BfjJyUm8.js:1:1497)

FAILED: 1 / 38
```

### После починки: 0 провалов

Здесь захвачен только хвост вывода — команда прогонялась через
`Select-Object -Last 20`. Полного списка из 38 строк для этого прогона нет,
итоговая строка `FAILED: 0 / 38` относится к нему.

```
PASS  после успеха ушли на карточку
PASS  тост об успехе
PASS  мок-store изменил цену — 142 000 ₽ → 139 500 ₽
PASS  торговый статус пересчитан — Не участвую → Лидирую
PASS  ставка видна в списке ставок
PASS  инвалидация докатилась до списка
PASS  hide_bets_history
PASS  hide_places
PASS  hide_points_address_and_contacts
PASS  no_view_cargo_price
PASS  Unknown показан нейтрально, страница жива
PASS  404 → error state
PASS  404 от API
PASS  нет горизонтального скролла на 390px — overflow=0px

--- console errors ---
[error] ApiError: GET /auctions/00000000-0000-4000-8000-000000000000 → 404
    at d (http://127.0.0.1:5200/assets/enums-BfjJyUm8.js:1:1497)

FAILED: 0 / 38
```

---

## 2. Причёсывание UI страницы списка — 23 проверки

Дублирование заголовка, замена нативных `select multiple` на чекбоксы, равная
высота групп, выравнивание сетки, группировка футера. Провалов нет.

```
PASS  1440px: нет горизонтального скролла — overflow=0px
PASS  1440px: ни один элемент не вылезает за вьюпорт — null
PASS  1440px: «Аукционы» не дублируется — вхождений=1
PASS  1440px: подзаголовок про адресную строку удалён
    1440px группы: [{"gid":"filter-auc-type","tag":"FIELDSET","outerH":130,"viewportH":128,"rowH":32,"rows":4,"checkboxes":4},{"gid":"filter-status","tag":"FIELDSET","outerH":130,"viewportH":128,"rowH":32,"rows":9,"checkboxes":9},{"gid":"filter-statuses","tag":"FIELDSET","outerH":130,"viewportH":128,"rowH":32,"rows":7,"checkboxes":7}]
PASS  1440px: нативных <select multiple> не осталось
PASS  1440px: все три группы — чекбоксы
PASS  1440px: высота всех трёх групп одинаковая — H=130/130/130
PASS  1440px: влезает целое число строк — 128/32 128/32 128/32
PASS  1440px: подписи и поля выровнены по строкам сетки — строк=3, расхождений=0
PASS  1440px: счётчик и «Сбросить» рядом, а не по краям — зазор=12px при ширине 1086px
PASS  390px: нет горизонтального скролла — overflow=0px
PASS  390px: ни один элемент не вылезает за вьюпорт — null
PASS  390px: «Аукционы» не дублируется — вхождений=1
PASS  390px: подзаголовок про адресную строку удалён
    390px группы: [{"gid":"filter-auc-type","tag":"FIELDSET","outerH":130,"viewportH":128,"rowH":32,"rows":4,"checkboxes":4},{"gid":"filter-status","tag":"FIELDSET","outerH":130,"viewportH":128,"rowH":32,"rows":9,"checkboxes":9},{"gid":"filter-statuses","tag":"FIELDSET","outerH":130,"viewportH":128,"rowH":32,"rows":7,"checkboxes":7}]
PASS  390px: нативных <select multiple> не осталось
PASS  390px: все три группы — чекбоксы
PASS  390px: высота всех трёх групп одинаковая — H=130/130/130
PASS  390px: влезает целое число строк — 128/32 128/32 128/32
PASS  390px: подписи и поля выровнены по строкам сетки — строк=12, расхождений=0
PASS  390px: счётчик и «Сбросить» рядом, а не по краям — зазор=12px при ширине 324px
PASS  клик по чекбоксу пишет значение в URL — ?page=1&per_page=20&auc_type=%5B%22Down%22%5D
PASS  выдача отфильтрована
PASS  состояние чекбокса восстановлено из URL

--- console errors ---
(none)

FAILED: 0 / 23
```

---

## 3. Сжатие панели фильтров — 23 проверки

Упаковка полей по фактической высоте, отсутствие внутреннего скролла у групп,
три колонки на >=1024px, состояние кнопки «Сбросить».

Два провала — это метрика «панель занимает меньше половины экрана»: 521px против
порога 450px на 1440px. Порог тремя колонками недостижим, мешает фиксированная
обвязка над панелью. Цель, ради которой он ставился, выполнена: строка
`список виден без прокрутки` проходит, в первый экран попадает 3 карточки.

```
390px: [{"gid":"filter-auc-type","total":4,"visible":4,"scrollable":false,"innerCols":"1","h":94},{"gid":"filter-stat
us","total":9,"visible":9,"scrollable":false,"innerCols":"2","h":114},{"gid":"filter-statuses","total":7,"visible":7,"s
crollable":false,"innerCols":"2","h":94}]
PASS  390px: нет горизонтального скролла — overflow=0px
PASS  390px: колонок в сетке = 1 — columnCount=1
PASS  390px: у групп нет внутреннего скролла
PASS  390px: все значения видны сразу — filter-auc-type:4/4 filter-status:9/9 filter-statuses:7/7
PASS  390px: «Сбросить» неактивна без фильтров
  1024px: [{"gid":"filter-auc-type","total":4,"visible":4,"scrollable":false,"innerCols":"1","h":94},{"gid":"filter-sta
tus","total":9,"visible":9,"scrollable":false,"innerCols":"2","h":134},{"gid":"filter-statuses","total":7,"visible":7,"
scrollable":false,"innerCols":"2","h":114}]
PASS  1024px: нет горизонтального скролла — overflow=0px
PASS  1024px: колонок в сетке = 3 — columnCount=3
PASS  1024px: у групп нет внутреннего скролла
PASS  1024px: все значения видны сразу — filter-auc-type:4/4 filter-status:9/9 filter-statuses:7/7
PASS  1024px: «Сбросить» неактивна без фильтров
FAIL  1024px: панель занимает меньше половины экрана — низ панели=535px, половина=450px, высота панели=418px
PASS  1024px: список виден без прокрутки — первая карточка на 551px, карточек в экране=3
PASS  1024px: длинные группы в две колонки — filter-auc-type:1 filter-status:2 filter-statuses:2
  1440px: [{"gid":"filter-auc-type","total":4,"visible":4,"scrollable":false,"innerCols":"1","h":94},{"gid":"filter-sta
tus","total":9,"visible":9,"scrollable":false,"innerCols":"2","h":114},{"gid":"filter-statuses","total":7,"visible":7,"
scrollable":false,"innerCols":"2","h":94}]
PASS  1440px: нет горизонтального скролла — overflow=0px
PASS  1440px: колонок в сетке = 3 — columnCount=3
PASS  1440px: у групп нет внутреннего скролла
PASS  1440px: все значения видны сразу — filter-auc-type:4/4 filter-status:9/9 filter-statuses:7/7
PASS  1440px: «Сбросить» неактивна без фильтров
FAIL  1440px: панель занимает меньше половины экрана — низ панели=521px, половина=450px, высота панели=404px
PASS  1440px: список виден без прокрутки — первая карточка на 537px, карточек в экране=3
PASS  1440px: длинные группы в две колонки — filter-auc-type:1 filter-status:2 filter-statuses:2
PASS  1440px: поля упакованы по фактической высоте, без дыр — колонок=3, максимальный зазор=8px (ожидаем ~12px = mb-3)
PASS  «Сбросить» активна, когда фильтр задан — Активных фильтров: 1
--- console errors ---
(none)
FAILED: 2 / 23
```

---

## 4. Prefetch по intent, содержимое карточки, флаг моков — 15 проверок

Запросы считались через CDP-домен `Network`: учитывались только
`GET /api/v1/auctions/{uuid}` без `/bets`. Наведение эмулировалось настоящим
`Input.dispatchMouseEvent`, фокус — настоящими нажатиями Tab
(`Input.dispatchKeyEvent`), а не программным `.focus()`.

### Prefetch и карточка списка

```
PASS  наведение мышью инициирует GET детальной — запросов=1
PASS  переход после hover ушёл на карточку — /auctions/c1ec5ee2-5275-42ac-8df9-0183d9dcee0e
PASS  после hover переход не повторяет запрос детальной — дополнительных запросов=0
PASS  ставки при этом догружаются отдельным запросом
PASS  фокус с клавиатуры инициирует GET детальной — Tab нажат 37 раз, фокус на card:/auctions/c1ec5ee2-5275-42ac-8df9-0183d9dcee0e, запросов=1
  карточки: {"total":20,"withPerKm":20,"perKmSample":"33,98 ₽/км","hasEdit":true,"editSaysMyBet":true,"editBadge":true,"editHref":"/auctions/7d060fde-c090-4e96-8f11-d7c2c86c68bd/bid","hasCreate":true}
PASS  цена за км есть во всех карточках — 20/20, пример «33,98 ₽/км»
PASS  в списке есть карточка с «Изменить ставку»
PASS  у неё показана своя ставка
PASS  у неё есть бейдж «Моя ставка есть»
PASS  её действие ведёт на форму ставки — /auctions/7d060fde-c090-4e96-8f11-d7c2c86c68bd/bid
PASS  в списке есть и карточка с «Сделать ставку»

--- exceptions ---
(none)

FAILED: 0 / 11
```

### Флаг VITE_ENABLE_MOCKS

Отдельная сборка `VITE_ENABLE_MOCKS=false npm run build` на порту 5201.
Бэкенда нет, поэтому ожидаемый результат — живое приложение с error state,
а не белый экран.

```
PASS  MSW не поднялся при VITE_ENABLE_MOCKS=false
PASS  service worker не контролирует страницу
PASS  воркер даже не запрашивался — запросов=0
PASS  приложение живо и показывает error state вместо данных — Грузовые аукционы |  | Не удалось загрузить список аукционов | 
FAILED: 0 / 4
```
