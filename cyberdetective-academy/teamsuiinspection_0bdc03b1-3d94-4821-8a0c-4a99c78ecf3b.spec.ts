
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('TeamsUIInspection_2025-07-22', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5173');

    // Take screenshot
    await page.screenshot({ path: 'homepage.png' });

    // Fill input field
    await page.fill('input[type="email"]', 'ivan.agustin.95@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Vortex733-');

    // Click element
    await page.click('button[type="submit"]');

    // Take screenshot
    await page.screenshot({ path: 'dashboard-after-login.png' });

    // Click element
    await page.click('a[href="/teams"]');

    // Take screenshot
    await page.screenshot({ path: 'teams-page-current.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text('👥 Miembros')');

    // Take screenshot
    await page.screenshot({ path: 'team-members-tab.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text('➕ Invitar Miembro')');

    // Take screenshot
    await page.screenshot({ path: 'invite-member-form.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/leaderboard"]');

    // Take screenshot
    await page.screenshot({ path: 'leaderboard-individuals.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text('👥 Equipos')');

    // Take screenshot
    await page.screenshot({ path: 'team-ranking-current.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/teams"]');

    // Click element
    await page.click('button:has-text('🚪 Salir')');
});