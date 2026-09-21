import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('');
});

test('nav links are visible with expected text', async ({ page }) => {
  await expect(page.getByTestId('nav-forms')).toHaveText('Forms');
  await expect(page.getByTestId('nav-widgets')).toHaveText('Widgets');
  await expect(page.getByTestId('nav-api')).toHaveText('API');
});

test('session status starts logged out', async ({ page }) => {
  await expect(page.getByTestId('session-status')).toHaveText('Logged out');
});

test('country select has expected options', async ({ page }) => {
  const select = page.getByTestId('input-country');
  await expect(select).toBeVisible();
  await expect(select.locator('option')).toHaveCount(5);
});

test('free plan radio is checked by default', async ({ page }) => {
  await expect(page.getByTestId('radio-plan-free')).toBeChecked();
  await expect(page.getByTestId('radio-plan-pro')).not.toBeChecked();
});

test('modal is hidden until opened', async ({ page }) => {
  const modal = page.getByTestId('demo-modal');
  await expect(modal).toBeHidden();
  await page.getByTestId('open-modal').click();
  await expect(modal).toBeVisible();
});

test('slider reflects its value label', async ({ page }) => {
  const slider = page.getByTestId('slider-volume');
  await expect(page.getByTestId('slider-value')).toHaveText('50');
  await slider.fill('80');
  await expect(page.getByTestId('slider-value')).toHaveText('80');
});
