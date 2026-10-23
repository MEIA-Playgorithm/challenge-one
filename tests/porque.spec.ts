import { test, expect } from './fixtures/dialogue';

test('porquê: explica a pergunta sem responder nem avançar o diálogo', async ({ page, dialogueUser }) => {
  await page.getByRole('button', { name: 'Porquê esta pergunta?', exact: true }).click();
  await expect(page.getByText('A tua escolha permite-me concluir:', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar a regra dialogo_experiencia', exact: true }).click();
  await expect(page.getByText(`user(${dialogueUser})`, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recomeçar', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Mudar esta resposta' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Esconder', exact: true }).click();
  await page.getByRole('button', { name: 'Comédia', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sim', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Porquê esta pergunta?', exact: true }).last().click();
  await expect(page.getByText('Se responderes Sim, posso concluir:', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar a regra dialogo_comedia_2', exact: true }).click();
  await expect(page.getByText(`prefere_romance_com_humor(${dialogueUser})`, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mudar esta resposta' })).toHaveCount(1);
  await expect(page.getByText('É tudo o que precisava. As tuas sugestões estão prontas.', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Esconder', exact: true }).click();
  await page.getByRole('button', { name: 'Sim', exact: true }).click();
  await expect(page.getByText('É tudo o que precisava. As tuas sugestões estão prontas.', { exact: true })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Sugerir: Romantic Comedy' })).toHaveCount(1);
});
