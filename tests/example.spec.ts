import { randomUUID } from 'node:crypto';
import { test, expect, type Page, type Response } from '@playwright/test';

// Integração real: nenhuma resposta da base de conhecimento ou do Drools é simulada.
test('cria o perfil do Tiago pela interface e consulta o Drools', async ({ page, request }, testInfo) => {
  test.setTimeout(120_000);
  page.setDefaultTimeout(15_000);
  const userId = `tiago_e2e_${randomUUID().replaceAll('-', '')}`;
  const configResponse = await request.get('/config.json');
  expect(configResponse.ok(), 'O frontend deve disponibilizar config.json').toBeTruthy();
  const config = await configResponse.json();
  const kb = config.knowledgeBaseUrl.replace(/\/$/, '');
  const drools = config.engines.drools.baseUrl.replace(/\/$/, '');
  const userUrl = `${kb}/users/${encodeURIComponent(userId)}`;
  let created = false;

  const responseFor = (url: string, method: string) => page.waitForResponse(
    response => response.url() === url && response.request().method() === method,
  );
  const successful = async (response: Response) => {
    expect(response.ok(), `${response.request().method()} ${response.url()}: ${await response.text()}`).toBeTruthy();
  };
  const save = async () => {
    const saved = responseFor(userUrl, 'PUT');
    const reloaded = responseFor(`${drools}/api/reload/users`, 'POST');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await successful(await saved);
    await successful(await reloaded);
    await expect(page.getByText('Todas as alterações guardadas', { exact: true })).toBeVisible();
  };

  try {
    await test.step('Criar utilizador e confirmar recarregamento do Drools', async () => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Novo utilizador', exact: true }).click();
      await page.getByRole('textbox', { name: 'Nome', exact: true }).fill(userId);
      await page.getByRole('spinbutton', { name: 'Idade', exact: true }).fill('46');
      const creation = responseFor(`${kb}/users`, 'POST');
      const reload = responseFor(`${drools}/api/reload/users`, 'POST');
      await page.locator('form').getByRole('button', { name: 'Guardar', exact: true }).click();
      const result = await creation;
      created = result.ok();
      await successful(result);
      await successful(await reload);
      await expect(page.getByRole('heading', { name: userId, exact: true })).toBeVisible();
      await expect(page.getByText('46 anos', { exact: true })).toBeVisible();
    });

    await test.step('Preencher e guardar as preferências do exemplo', async () => {
      for (const genre of ['Ação', 'Thriller', 'Drama']) {
        await page.getByRole('button', { name: genre, exact: true }).click();
      }
      // Os chips alternam entre neutro, gosto e não gosto.
      for (const disliked of ['Musical', 'Inglês']) {
        await page.getByRole('button', { name: disliked, exact: true }).click();
        await page.getByRole('button', { name: disliked, exact: true }).click();
      }
      for (const language of ['Mandarim', 'Francês']) {
        await page.getByRole('button', { name: language, exact: true }).click();
      }
      await choose(page, 'Subgéneros preferidos', 'Wuxia');
      await choose(page, 'Idiomas obrigatórios', 'Mandarim');
      await choose(page, 'Idiomas obrigatórios', 'Francês');
      for (const [label, values] of Object.entries({
        Ritmo: ['Rápido'], Complexidade: ['Médio', 'Alto'], Violência: ['Médio'],
        Humor: ['Baixo'], 'Intensidade psicológica': ['Médio', 'Alto'],
        Público: ['Nicho'], Época: ['Moderno'], Popularidade: ['Menos popular'],
      })) {
        for (const value of values) {
          await page.getByRole('group', { name: label, exact: true })
            .getByRole('button', { name: value, exact: true }).click();
        }
      }
      for (const value of ['Tenso', 'Reflexivo', 'Exploração', 'Psicologia']) {
        await page.getByRole('button', { name: value, exact: true }).click();
      }
      for (const [label, value] of Object.entries({
        'Duração máxima': '210', 'Espectador mais novo': '46', 'Lançado desde': '2000', 'Lançado até': '2019',
      })) {
        await page.getByRole('spinbutton', { name: label, exact: true }).fill(value);
      }
      const rating = page.getByRole('slider', { name: 'Classificação IMDb mínima', exact: true });
      await rating.focus();
      await rating.press('Home');
      for (let i = 0; i < 15; i++) await rating.press('ArrowRight');
      await expect(rating).toHaveValue('7.5');
      await page.getByRole('switch', { name: /Mínimo estrito/ }).check();
      await expect(page.getByRole('slider', { name: 'Tolerância da classificação', exact: true })).toHaveValue('0');
      await expect(page.getByRole('switch', { name: /Permitir rever/ })).not.toBeChecked();
      await save();
    });

    await test.step('Adicionar filme visto e wishlist pela interface', async () => {
      await page.getByRole('tab', { name: 'Filmes', exact: true }).click();
      await choose(page, 'Adicionar um filme visto', 'Farewell, Friend (2008)');
      await expect(page.getByText('Visto, sem opinião', { exact: true })).toBeVisible();
      await choose(page, 'Quero ver', 'A Touch of Zen (2002)');
      await save();
    });

    await test.step('Verificar o perfil persistido e a apresentação da resposta real do Drools', async () => {
      const stored = await request.get(userUrl);
      expect(stored.ok()).toBeTruthy();
      const profile = await stored.json();
      expect(profile).toMatchObject({
        user_id: userId, age: '46', watched: 'tt0062639=0', wishlist: 'tt0064451',
        disliked_genres: 'Musical', disliked_languages: 'English', preferred_subgenres: 'Wuxia',
        preferred_pace: 'fast', preferred_violence: 'medium', preferred_humor: 'low',
        preferred_audience: 'niche', preferred_eras: 'modern', preferred_popularity: 'less_popular',
        max_duration_minutes: '210', year_from: '2000', year_to: '2019', session_min_age: '46',
        min_rating: '7.5', rating_tolerance: '0', rating_required: 'true', allow_rewatch: 'false',
        preferred_directors: '', preferred_writers: '', preferred_stars: '', preferred_countries: '',
        disliked_directors: '', disliked_stars: '',
      });
      for (const [field, values] of Object.entries({
        preferred_genres: ['Action', 'Thriller', 'Drama'], preferred_languages: ['Mandarin', 'French'],
        required_languages: ['Mandarin', 'French'], preferred_complexity: ['medium', 'high'],
        preferred_psychological_intensity: ['medium', 'high'],
        preferred_emotional_tones: ['tense', 'reflective'], preferred_themes: ['exploration', 'psychology'],
      })) expect(profile[field].split('|').sort(), field).toEqual([...values].sort());

      await page.getByRole('tab', { name: 'Recomendações', exact: true }).click();
      const recommendations = page.waitForResponse(response => {
        const url = new URL(response.url());
        return url.origin + url.pathname === `${drools}/api/recomendacoes_utilizador`
          && url.searchParams.get('user_id') === userId && response.request().method() === 'GET';
      });
      await page.getByRole('button', { name: config.engines.drools.label, exact: true }).click();
      const response = await recommendations;
      await successful(response);
      expect(new URL(response.url()).searchParams.get('limit')).toBe('20');
      const data = await response.json();
      expect(Array.isArray(data.items)).toBeTruthy();
      await testInfo.attach('drools-response', { body: JSON.stringify(data, null, 2), contentType: 'application/json' });
      const results = page.locator('section').filter({ has: page.getByRole('list') });
      await expect(results).toHaveCount(1);
      await expect(results.locator('ul > li')).toHaveCount(data.items.length);
      if (data.items.length === 0) {
        // Os filtros estritos podem legitimamente excluir todo o catálogo.
        await expect(results.getByText('Sem filmes elegíveis.', { exact: true })).toBeVisible();
      }
      for (const [index, item] of data.items.entries()) {
        const row = results.locator('ul > li').nth(index);
        await expect(row).toContainText(item.movie.title);
        await expect(row).toContainText(`${item.score} pts`);
        await expect(row).toContainText(`IMDb ${item.movie.rating_imdb == null ? '?' : Number(item.movie.rating_imdb).toFixed(1)}`);
        expect(item.movie.id).not.toBe('tt0062639');
      }
      await expect(page.getByText(/Reload failed:/)).toHaveCount(0);
    });
  } finally {
    // Só elimina o perfil desta execução; nunca altera um Tiago já existente.
    if (created) {
      const deleted = await request.delete(userUrl);
      expect(deleted.ok(), 'Limpeza do utilizador de teste').toBeTruthy();
      const reload = await request.post(`${drools}/api/reload/users`);
      expect(reload.ok(), 'Recarregamento do Drools após limpeza').toBeTruthy();
    }
  }
});

async function choose(page: Page, label: string, option: string) {
  const input = page.getByRole('combobox', { name: label, exact: true });
  await input.fill(option);
  await page.getByRole('option', { name: option, exact: true }).click();
  await input.press('Escape');
}
