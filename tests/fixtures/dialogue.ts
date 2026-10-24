import { test as base, expect } from './user';

export const test = base.extend<{ dialogueUser: string }>({
  dialogueUser: async ({ page, testUser }, use) => {
    await page.getByRole('tab', { name: 'Diálogo', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Comédia', exact: true })).toBeEnabled();
    await use(testUser);
  },
});
export { expect };
