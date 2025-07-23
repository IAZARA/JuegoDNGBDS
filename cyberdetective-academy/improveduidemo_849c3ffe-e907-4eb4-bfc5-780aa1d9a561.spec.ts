
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ImprovedUIDemo_2025-07-22', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5173');

    // Fill input field
    await page.fill('input[type="email"]', 'ivan.agustin.95@gmail.com');

    // Fill input field
    await page.fill('input[type="password"]', 'Vortex733-');

    // Click element
    await page.click('button[type="submit"]');

    // Click element
    await page.click('a[href="/teams"]');

    // Take screenshot
    await page.screenshot({ path: 'improved-teams-dashboard.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text('👥 Miembros')');

    // Take screenshot
    await page.screenshot({ path: 'improved-team-members.png', { fullPage: true } });

    // Click element
    await page.click('button:has-text('➕ Invitar Miembro')');

    // Take screenshot
    await page.screenshot({ path: 'improved-invite-form.png', { fullPage: true } });

    // Click element
    await page.click('a[href="/leaderboard"]');

    // Click element
    await page.click('button:has-text('👥 Equipos')');

    // Take screenshot
    await page.screenshot({ path: 'improved-team-ranking.png', { fullPage: true } });
});