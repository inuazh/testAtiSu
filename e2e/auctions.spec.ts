import { expect, type Locator, type Page, test } from '@playwright/test';

const AUC_TYPE_GROUP = 'Тип аукциона';
const DOWN_LABEL = 'На понижение';

function aucTypeCheckbox(page: Page): Locator {
  return page.getByRole('group', { name: AUC_TYPE_GROUP }).getByRole('checkbox', {
    name: DOWN_LABEL,
  });
}

function priceRegExp(value: number): RegExp {
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

  return new RegExp(`${formatted.replace(/[\s ]/g, '\\s')}\\s*₽`);
}

test.describe('фильтры', () => {
  test('чекбокс пишет фильтр в URL, меняет выдачу и переживает перезагрузку', async ({ page }) => {
    await page.goto('/auctions');

    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();
    const totalBefore = await cards.count();

    await aucTypeCheckbox(page).click();

    await expect(aucTypeCheckbox(page)).toBeChecked();
    await expect(page).toHaveURL(/auc_type=/);
    await expect(page).toHaveURL(/Down/);

    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card).toContainText(DOWN_LABEL);
    }
    expect(await cards.count()).toBeLessThan(totalBefore);

    await page.reload();

    await expect(aucTypeCheckbox(page)).toBeChecked();
    await expect(cards.first()).toContainText(DOWN_LABEL);
  });

  test('битые search params не роняют страницу, валидный фильтр применяется', async ({ page }) => {
    await page.goto('/auctions?page=abc&statuses=99&auc_type=Down');

    await expect(page.getByRole('heading', { name: 'Аукционы' })).toBeVisible();

    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();

    for (const card of await cards.all()) {
      await expect(card).toContainText(DOWN_LABEL);
    }

    await expect(aucTypeCheckbox(page)).toBeChecked();
  });

  test('фильтр без совпадений даёт empty state, а не бесконечный скелетон', async ({ page }) => {
    await page.goto('/auctions?cargo_num=НЕТ-ТАКОГО-НОМЕРА');

    await expect(page.getByText('Аукционы не найдены')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Сбросить фильтры' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
  });
});

test.describe('ставка', () => {
  test('форма по прямой ссылке, отправка и обновление списка', async ({ page }) => {
    await page.goto('/auctions?auc_type=Down&is_available=true&is_bidder=false');

    const firstCard = page.getByRole('article').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText('Не участвую');
    await expect(firstCard).toContainText('Сделать ставку');

    const cargoLink = firstCard.getByRole('link').first();
    const cargoNum = (await cargoLink.innerText()).trim();
    const href = await cargoLink.getAttribute('href');
    expect(href).toBeTruthy();

    const auctionUuid = (href ?? '').split('/auctions/')[1] ?? '';
    expect(auctionUuid).not.toBe('');

    const oldPrice = (await firstCard.innerText()).match(/^\s*([\d \s]+₽)\s*$/m)?.[1]?.trim();
    expect(oldPrice).toBeTruthy();

    await page.goto(`/auctions/${auctionUuid}/bid`);

    await expect(page.getByRole('heading', { name: `Ставка по заявке ${cargoNum}` })).toBeVisible();

    const priceInput = page.getByLabel(/Цена ставки/);
    await expect(priceInput).toBeVisible();

    const offeredPrice = Number(await priceInput.inputValue());
    expect(Number.isFinite(offeredPrice)).toBe(true);
    expect(offeredPrice).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Отправить ставку' }).click();

    await expect(page.getByText('Ставка принята')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/auctions/${auctionUuid}$`));

    await page.getByRole('link', { name: /К списку аукционов/ }).click();
    await page.getByLabel('Номер заявки').fill(cargoNum);

    const updated = page.getByRole('article').first();
    await expect(updated).toBeVisible();
    await expect(updated).toContainText('Лидирую');
    await expect(updated).toContainText('Моя ставка есть');
    await expect(updated).toContainText('Изменить ставку');
    await expect(updated).toContainText(priceRegExp(offeredPrice));
    await expect(updated).not.toContainText(oldPrice ?? '');
  });
});

test.describe('адаптивность', () => {
  test('на 390px нет горизонтального скролла', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/auctions');

    await expect(page.getByRole('article').first()).toBeVisible();

    await expect
      .poll(() =>
        page.evaluate(() => {
          const doc = document.documentElement;

          return doc.scrollWidth - doc.clientWidth;
        }),
      )
      .toBeLessThanOrEqual(0);
  });
});
