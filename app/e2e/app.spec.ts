import { expect, test } from '@playwright/test';

const serviceUrl = 'http://127.0.0.1:7847';
const workspacePath = 'C:\\Users\\tester\\project';

async function mockService(page: import('@playwright/test').Page) {
  await page.route(`${serviceUrl}/health`, async (route) => {
    await route.fulfill({ json: { status: 'ok', version: '0.1.0' } });
  });
  await page.route(`${serviceUrl}/workspace/init`, async (route) => {
    await route.fulfill({ json: { initialized: true, config: { version: 1, provider: null } } });
  });
  await page.route(`${serviceUrl}/fs/list?**`, async (route) => {
    await route.fulfill({ json: { entries: [{ name: 'README.md', path: `${workspacePath}\\README.md`, type: 'file' }] } });
  });
  await page.route(`${serviceUrl}/fs/read?**`, async (route) => {
    await route.fulfill({ json: { path: `${workspacePath}\\README.md`, content: '# Test workspace' } });
  });
  await page.route(`${serviceUrl}/fs/write`, async (route) => {
    await route.fulfill({ json: { success: true, path: `${workspacePath}\\README.md` } });
  });
  await page.route(`${serviceUrl}/terminal/exec`, async (route) => {
    await route.fulfill({ json: { stdout: 'ok', stderr: '', exitCode: 0, durationMs: 10 } });
  });
}

test('covers disconnected onboarding and workspace initialization', async ({ page }) => {
  await mockService(page);
  await page.goto('/');

  await expect(page.getByText('Checklist inicial')).toBeVisible();
  await page.getByLabel('Token').fill('test-token');
  await page.getByRole('button', { name: 'Conectar' }).click();
  await expect(page.getByLabel('Caminho do workspace')).toBeVisible();

  await page.getByLabel('Caminho do workspace').fill(workspacePath);
  await page.getByRole('button', { name: 'Inicializar' }).click();
  await expect(page.getByText('Workspace pronto.')).toBeVisible();
});

test('covers main IDE panels with mocked service responses', async ({ page }) => {
  await mockService(page);
  await page.goto('/');

  await page.getByLabel('Token').fill('test-token');
  await page.getByRole('button', { name: 'Conectar' }).click();
  await page.getByLabel('Caminho do workspace').fill(workspacePath);
  await page.getByRole('button', { name: 'Inicializar' }).click();

  await expect(page.getByLabel('Explorador de arquivos')).toBeVisible();
  await expect(page.getByLabel('Terminal integrado')).toBeVisible();
  await page.getByRole('button', { name: 'Atualizar' }).click();
  await page.getByText('README.md').click();
  await expect(page.getByLabel('Conteúdo do arquivo')).toHaveValue('# Test workspace');
  await page.getByRole('button', { name: 'Salvar arquivo' }).click();
  await page.getByLabel('Comando').fill('npm test --workspace=app');
  await page.getByRole('button', { name: 'Executar' }).click();
  await expect(page.getByText('ok', { exact: true })).toBeVisible();
});
