import { randomUUID } from 'node:crypto';
import { test as base, expect as baseExpect } from '@playwright/test';

const expect = baseExpect.configure({ timeout: 15_000 });

// Integração real: criação e limpeza exclusivamente pela interface.
export const test = base.extend<{ testUser: string }>({
  testUser: async ({ page }, use) => {
    base.setTimeout(120_000);
    page.setDefaultTimeout(15_000);
    const userId = `frontend_e2e_${randomUUID().replaceAll('-', '')}`;
    const configuration = page.waitForResponse(response => new URL(response.url()).pathname === '/config.json');
    await page.goto('/');
    const config = await (await configuration).json();
    const reloads = () => Object.values(config.engines as Record<string, { baseUrl: string }>).map(engine =>
      page.waitForResponse(response => response.url() === `${engine.baseUrl.replace(/\/$/, '')}/api/reload/users`
        && response.request().method() === 'POST', { timeout: 60_000 }).then(response => {
          expect(response.ok(), `Recarregamento: ${response.url()}`).toBeTruthy();
      }),
    );
    await page.getByRole('button', { name: 'Novo utilizador', exact: true }).click();
    await page.getByRole('textbox', { name: 'Nome', exact: true }).fill(userId);
    await page.getByRole('spinbutton', { name: 'Idade', exact: true }).fill('46');
    await Promise.all([...reloads(), page.locator('form').getByRole('button', { name: 'Guardar', exact: true }).click()]);
    await expect(page.getByRole('heading', { name: userId, exact: true })).toBeVisible();
    try {
      await use(userId);
    } finally {
      await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
      const confirmation = page.getByRole('dialog', { name: `Eliminar ${userId}?` });
      await Promise.all([...reloads(), confirmation.getByRole('button', { name: 'Eliminar', exact: true }).click()]);
      await expect(confirmation).not.toBeVisible();
      await expect(page.getByRole('heading', { name: userId, exact: true })).toHaveCount(0);
    }
  },
});
export { expect };
