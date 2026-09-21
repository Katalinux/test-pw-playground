import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('');
});

test('API section starts with no results and nothing shown', async ({ page }) => {
  await expect(page.getByTestId('api-results').locator('li')).toHaveCount(0);
  await expect(page.getByTestId('api-error')).toBeHidden();
  await expect(page.getByTestId('api-loading')).toBeHidden();
});

test('fetching posts renders results from the API', async ({ page }) => {
  await page.route('**/posts**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, title: 'First mock post' },
        { id: 2, title: 'Second mock post' },
      ]),
    })
  );

  await page.getByTestId('fetch-posts').click();

  await expect(page.getByTestId('api-results').locator('li')).toHaveCount(2);
  await expect(page.getByTestId('post-1')).toHaveText('First mock post');
  await expect(page.getByTestId('post-2')).toHaveText('Second mock post');
  await expect(page.getByTestId('api-error')).toBeHidden();
});

test('shows a loading state while the request is in flight', async ({ page }) => {
  await page.route('**/posts**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.getByTestId('fetch-posts').click();
  await expect(page.getByTestId('api-loading')).toBeVisible();
  await expect(page.getByTestId('api-loading')).toBeHidden();
});

test('shows an error message when the request fails', async ({ page }) => {
  await page.route('**/posts**', (route) => route.fulfill({ status: 500 }));

  await page.getByTestId('fetch-posts').click();

  await expect(page.getByTestId('api-error')).toBeVisible();
  await expect(page.getByTestId('api-results').locator('li')).toHaveCount(0);
});

test('clicking fetch again replaces previous results', async ({ page }) => {
  let requestCount = 0;
  await page.route('**/posts**', (route) => {
    requestCount += 1;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: requestCount, title: `Post ${requestCount}` }]),
    });
  });

  await page.getByTestId('fetch-posts').click();
  await expect(page.getByTestId('api-results').locator('li')).toHaveCount(1);
  await expect(page.getByTestId('post-1')).toHaveText('Post 1');

  await page.getByTestId('fetch-posts').click();
  await expect(page.getByTestId('api-results').locator('li')).toHaveCount(1);
  await expect(page.getByTestId('post-2')).toHaveText('Post 2');
});
