import { expect, test } from '@playwright/test';

test.describe('Sistema de Skins', () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que começa autenticado (usa o auth setup do projeto)
    await page.goto('/dashboard');
    await page.waitForURL('**/dashboard**');
  });

  test('página carrega com skin corporate por padrão', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-skin', 'corporate');
  });

  test('trocar skin via header atualiza data-skin imediatamente', async ({ page }) => {
    // Abrir o dropdown do SkinSwitcher
    await page.getByTitle('Alterar aparência').click();
    // Clicar em Noturno
    await page.getByText('Noturno').click();
    // Verificar que data-skin mudou
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-skin', 'noturno');
  });

  test('skin persiste após recarregar a página', async ({ page }) => {
    // Trocar para Moderno
    await page.getByTitle('Alterar aparência').click();
    await page.getByText('Moderno').click();
    // Recarregar
    await page.reload();
    await page.waitForURL('**/dashboard**');
    // Verificar persistência via cookie SSR
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-skin', 'moderno');
  });

  test('skin Noturno adiciona classe dark ao html', async ({ page }) => {
    await page.getByTitle('Alterar aparência').click();
    await page.getByText('Noturno').click();
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });
});
