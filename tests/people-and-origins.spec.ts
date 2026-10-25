import { test, expect } from './fixtures/user';
import type { Page } from '@playwright/test';

const fields = {
  'Realizadores de que gostas': 'King Hu',
  'Realizadores de que não gostas': 'Shirish Kunder',
  'Atores de que gostas': 'Feng Hsu',
  'Atores de que não gostas': 'Akshay Kumar',
  'Argumentistas de que gostas': 'Songling Pu',
  'Países de origem': 'Taiwan',
};

const picker = (page: Page, label: string) => page.locator('.MuiAutocomplete-root')
  .filter({ has: page.getByRole('combobox', { name: label, exact: true }) });

async function choose(page: Page, label: string, value: string) {
  const input = page.getByRole('combobox', { name: label, exact: true });
  await input.fill(value);
  await page.getByRole('option', { name: value, exact: true }).click();
  await input.press('Escape');
}

async function save(page: Page) {
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByText('Todas as alterações guardadas', { exact: true })).toBeVisible();
}

test('Pessoas e origens: guarda os seis campos e mantém os valores após recarregar', async ({ page, testUser }) => {
  await page.getByRole('tab', { name: 'Pessoas e origens', exact: true }).click();
  for (const [label, value] of Object.entries(fields)) await choose(page, label, value);
  await save(page);
  await page.reload();
  await page.getByRole('button').filter({ hasText: testUser }).click();
  await expect(page.getByRole('heading', { name: testUser, exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Pessoas e origens', exact: true }).click();
  for (const [label, value] of Object.entries(fields)) {
    await expect(picker(page, label).getByText(value, { exact: true })).toBeVisible();
  }
});

test('Pessoas e origens: rejeitar um realizador ou ator remove a preferência incompatível', async ({ page, testUser }) => {
  await page.getByRole('tab', { name: 'Pessoas e origens', exact: true }).click();
  for (const [liked, disliked, value] of [
    ['Realizadores de que gostas', 'Realizadores de que não gostas', 'King Hu'],
    ['Atores de que gostas', 'Atores de que não gostas', 'Feng Hsu'],
  ]) {
    await choose(page, liked, value);
    await expect(picker(page, liked).getByText(value, { exact: true })).toBeVisible();
    await choose(page, disliked, value);
    await expect(picker(page, liked).getByText(value, { exact: true })).toHaveCount(0);
    await expect(picker(page, disliked).getByText(value, { exact: true })).toBeVisible();
  }
  await save(page);
  await page.getByRole('tab', { name: 'Preferências', exact: true }).click();
  await page.getByRole('tab', { name: 'Pessoas e origens', exact: true }).click();
  for (const [liked, disliked, value] of [
    ['Realizadores de que gostas', 'Realizadores de que não gostas', 'King Hu'],
    ['Atores de que gostas', 'Atores de que não gostas', 'Feng Hsu'],
  ]) {
    await expect(picker(page, liked).getByText(value, { exact: true })).toHaveCount(0);
    await expect(picker(page, disliked).getByText(value, { exact: true })).toBeVisible();
  }
});
