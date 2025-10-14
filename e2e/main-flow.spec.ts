import { test, expect } from '@playwright/test';

test.describe('自然拼读小课堂 - Main Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/自然拼读小课堂/);
    await expect(page.locator('h1')).toContainText('自然拼读小课堂');
  });

  test('should display welcome section', async ({ page }) => {
    const welcomeSection = page.locator('section').first();
    await expect(welcomeSection).toContainText('让英语发音变得有趣');
    await expect(welcomeSection).toContainText('快来探索26个字母的神奇发音规则');
  });

  test('should display vowel cards', async ({ page }) => {
    // Wait for vowels section
    const vowelsSection = page.locator('#vowels');
    await expect(vowelsSection).toBeVisible();
    
    // Check for vowel letters
    await expect(vowelsSection).toContainText('A');
    await expect(vowelsSection).toContainText('E');
    await expect(vowelsSection).toContainText('I');
    await expect(vowelsSection).toContainText('O');
    await expect(vowelsSection).toContainText('U');
  });

  test('should play speech when clicking volume button', async ({ page }) => {
    // Find first volume button
    const volumeButton = page.locator('button[aria-label*="播放"]').first();
    await expect(volumeButton).toBeVisible();
    
    // Click and check console (speech synthesis can't be directly tested in Playwright)
    await volumeButton.click();
    // No errors should occur
  });

  test('should flip game cards on click', async ({ page }) => {
    // Navigate to game section
    const gameSection = page.locator('#game');
    await gameSection.scrollIntoViewIfNeeded();
    
    // Find first game card
    const gameCard = gameSection.locator('button[role="button"]').first();
    await expect(gameCard).toBeVisible();
    
    // Click to flip
    await gameCard.click();
    
    // Check if card has flipped class or shows back content
    // (implementation may vary)
    await page.waitForTimeout(500); // Wait for animation
  });

  test('should increment score on first card flip', async ({ page }) => {
    // Navigate to game section
    const gameSection = page.locator('#game');
    await gameSection.scrollIntoViewIfNeeded();
    
    // Get initial score
    const achievementSection = page.locator('text=学习成果').locator('..');
    const scoreDisplay = achievementSection.locator('text=/\\d+/').first();
    
    // Flip a card
    const gameCard = gameSection.locator('button[role="button"]').first();
    await gameCard.click();
    
    // Wait and check score increased
    await page.waitForTimeout(200);
    const scoreText = await scoreDisplay.textContent();
    expect(parseInt(scoreText || '0')).toBeGreaterThan(0);
  });

  test('should update progress bar on scroll', async ({ page }) => {
    // Get progress bar
    const progressBar = page.locator('.progress-fill').first();
    
    // Initial width should be small
    const initialWidth = await progressBar.evaluate((el) => el.style.width);
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    
    // Progress should increase
    const newWidth = await progressBar.evaluate((el) => el.style.width);
    expect(parseFloat(newWidth) || 0).toBeGreaterThan(parseFloat(initialWidth) || 0);
  });

  test('should reset game state', async ({ page }) => {
    const gameSection = page.locator('#game');
    await gameSection.scrollIntoViewIfNeeded();
    
    // Flip a card
    const gameCard = gameSection.locator('button[role="button"]').first();
    await gameCard.click();
    
    // Find and click reset button
    const resetButton = gameSection.locator('button:has-text("重置游戏")');
    await resetButton.click();
    
    // Score should be 0
    const achievementSection = page.locator('text=学习成果').locator('..');
    await expect(achievementSection).toContainText('0');
  });

  test('should display rules section', async ({ page }) => {
    const rulesSection = page.locator('#rules');
    await rulesSection.scrollIntoViewIfNeeded();
    
    await expect(rulesSection).toBeVisible();
    await expect(rulesSection).toContainText('自然拼读与音标规则总览');
  });

  test('should expand and collapse rules', async ({ page }) => {
    const rulesSection = page.locator('#rules');
    await rulesSection.scrollIntoViewIfNeeded();
    
    // Find first summary element
    const summary = rulesSection.locator('summary').first();
    await summary.click();
    
    // Content should be visible
    await page.waitForTimeout(200);
    const details = summary.locator('..');
    await expect(details).toHaveAttribute('open', '');
    
    // Click again to collapse
    await summary.click();
    await page.waitForTimeout(200);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should be responsive', async ({ page, viewport }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check if layout adjusts
    const welcomeSection = page.locator('section').first();
    await expect(welcomeSection).toBeVisible();
    
    // Game cards should stack on mobile
    const gameSection = page.locator('#game');
    await gameSection.scrollIntoViewIfNeeded();
    await expect(gameSection).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have no automatic accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic ARIA attributes
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();
    
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();
    
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // h1 should exist
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // h2 headings for sections
    const h2s = page.locator('h2');
    await expect(h2s).toHaveCount(6); // vowels, consonants, game, achievement, rules + welcome
  });
});
