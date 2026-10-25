import { test, expect } from './fixtures/user';

test('Recomendações: compara motores, abre explicações e alterna entre painel e separador', async ({ page, testUser }) => {
  await page.getByRole('tab', { name: 'Filmes', exact: true }).click();
  const wishlist = page.getByRole('combobox', { name: 'Quero ver', exact: true });
  await wishlist.fill('A Touch of Zen');
  await page.getByRole('option', { name: 'A Touch of Zen (2002)', exact: true }).click();
  await wishlist.press('Escape');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByText('Todas as alterações guardadas', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Recomendações', exact: true }).click();
  const noEngine = page.getByText('Nenhum motor selecionado. Seleciona pelo menos um motor para ver recomendações.', { exact: true });
  await expect(noEngine).toBeVisible();
  for (const engine of ['SWI-Prolog', 'Drools']) {
    await page.getByRole('button', { name: engine, exact: true }).click();
    await expect(page.getByRole('button', { name: engine, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(noEngine).toHaveCount(0);
  await expect(page.locator('section').filter({ has: page.getByRole('list') })).toHaveCount(2);
  for (const engine of ['SWI-Prolog', 'Drools']) {
    const section = page.locator('section').filter({ has: page.getByRole('list') }).filter({ has: page.getByText(engine, { exact: true }) });
    const movie = section.locator('ul > li').filter({ hasText: 'A Touch of Zen' });
    await expect(movie).toBeVisible();
    await expect(movie).toContainText(/IMDb \d+\.\d · \d+(?:\.\d+)? pts/);
    const explain = movie.getByRole('button', { name: 'Explicar A Touch of Zen', exact: true });
    await expect(explain).toHaveAttribute('aria-expanded', 'false');
    await explain.click();
    await expect(explain).toHaveAttribute('aria-expanded', 'true');
    await expect(movie.getByText('Porque foi recomendado', { exact: true })).toBeVisible();
    await expect(movie).toContainText('wishlist');
    await expect(movie.getByText('Pontuação', { exact: true })).toBeVisible();
    await explain.click();
    await expect(movie.getByText('Porque foi recomendado', { exact: true })).not.toBeVisible();
  }
  await page.getByRole('button', { name: 'Mostrar recomendações ao lado', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Recomendações', exact: true })).toHaveCount(0);
  await expect(page.locator('section').filter({ has: page.getByRole('list') })).toHaveCount(2);
  await page.getByRole('button', { name: 'Mostrar recomendações como separador', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Recomendações', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'SWI-Prolog', exact: true }).click();
  await expect(page.locator('section').filter({ has: page.getByRole('list') })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Drools', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Drools', exact: true }).click();
  await expect(noEngine).toBeVisible();
  await expect(page.locator('section').filter({ has: page.getByRole('list') })).toHaveCount(0);
});

test('Recomendações: mostra ausência de filmes elegíveis em ambos os motores', async ({ page, testUser }) => {
  // Nenhum filme do catálogo tem duração igual ou inferior a um minuto.
  await page.getByRole('spinbutton', { name: 'Duração máxima', exact: true }).fill('1');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByText('Todas as alterações guardadas', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Recomendações', exact: true }).click();
  for (const engine of ['SWI-Prolog', 'Drools']) {
    await page.getByRole('button', { name: engine, exact: true }).click();
  }
  for (const engine of ['SWI-Prolog', 'Drools']) {
    const section = page.locator('section').filter({ has: page.getByRole('list') }).filter({ has: page.getByText(engine, { exact: true }) });
    await expect(section.getByText('Sem filmes elegíveis.', { exact: true })).toBeVisible();
    await expect(section.locator('ul > li')).toHaveCount(0);
  }
});
