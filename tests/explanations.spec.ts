import { test, expect } from './fixtures/dialogue';

test('como: mostra a regra e as premissas de uma conclusão no Diálogo', async ({ page, dialogueUser }) => {
  await page.getByRole('button', { name: 'Comédia', exact: true }).click();
  await page.getByRole('button', { name: 'Sim', exact: true }).click();
  const conclusion = page.getByRole('listitem').filter({ hasText: 'Sugerir: Romantic Comedy' });
  await expect(conclusion).toBeVisible();
  await expect(conclusion).not.toContainText('Regra dialogo_comedia_2');
  await conclusion.getByRole('button', { name: 'como?', exact: true }).click();
  await expect(conclusion).toContainText('Regra dialogo_comedia_2, porque: Experiência: Comédia; Respondeste sim');
  await expect(conclusion).toContainText(`${dialogueUser}, preferes humor ligado a uma história romântica?`);
  await conclusion.getByRole('button', { name: 'esconder', exact: true }).click();
  await expect(conclusion).not.toContainText('Regra dialogo_comedia_2');
});

test('whynot: explica uma conclusão excluída e recalcula ao mudar a resposta', async ({ page, dialogueUser }) => {
  await page.getByRole('button', { name: 'Comédia', exact: true }).click();
  await page.getByRole('button', { name: 'Não', exact: true }).click();
  await expect(page.getByText('Excluído', { exact: true })).toBeVisible();
  const excluded = page.getByRole('listitem').filter({ hasText: 'Sugerir: Romantic Comedy' });
  await expect(excluded).toContainText(`respondeste Não a “${dialogueUser}, preferes humor ligado a uma história romântica?”`);
  await expect(excluded.getByRole('button', { name: 'como?', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Mudar esta resposta', exact: true }).nth(1).click();
  await expect(page.getByText('Excluído', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sim', exact: true }).click();
  await expect(excluded.getByRole('button', { name: 'como?', exact: true })).toBeVisible();
});

test('preserva respostas entre separadores e limpa o ramo ao rever ou recomeçar', async ({ page, dialogueUser }) => {
  await page.getByRole('button', { name: 'Comédia', exact: true }).click();
  await page.getByRole('button', { name: 'Sim', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mudar esta resposta' })).toHaveCount(2);
  await page.getByRole('tab', { name: 'Preferências', exact: true }).click();
  await page.getByRole('tab', { name: 'Diálogo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mudar esta resposta' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Mudar esta resposta' }).first().click();
  await expect(page.getByRole('button', { name: 'Mudar esta resposta' })).toHaveCount(0);
  await expect(page.getByText('Sugerir: Romantic Comedy', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ação', exact: true }).click();
  await page.getByRole('button', { name: 'Sim', exact: true }).click();
  await expect(page.getByText('Sugerir: Aventura', { exact: true })).toBeVisible();
  await expect(page.getByText('Sugerir: Comédia', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Recomeçar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Comédia', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Mudar esta resposta' })).toHaveCount(0);
  await expect(page.getByText('O que concluí', { exact: true })).toHaveCount(0);
});
