const { test, expect } = require("@playwright/test");

test("Course page can be accessed through main page", async({ page }) => {
    await page.goto("/");
    await page.locator('button:has-text("See More")').first().click();
    expect(await page.title()).toBe("Questions");
})

test("Course page functions properly", async({ page }) => {
    await page.goto("/courses?id=1");
    expect(await page.title()).toBe("Questions");
    await expect(page.locator('text=Homepage')).toHaveText("Homepage");
    await expect(page.locator('text=Ask question')).toHaveText("Ask question");
    await expect(page.locator('text=How to use loops?')).toHaveText("How to use loops?");
    await expect(page.locator('text=What is a variable?')).toHaveText("What is a variable?");
})