const { test, expect } = require("@playwright/test");

test("Main page functions properly", async({ page }) => {
    await page.goto("/");
    expect(await page.title()).toBe("Courses");
    await expect(page.locator('text=Courses')).toHaveText("Courses");
    await expect(page.locator('text=Homepage')).toHaveText("Homepage");
    await expect(page.locator('text=Introduction to Programming')).toHaveText("Introduction to Programming");
    await expect(page.locator('p:has-text("Data Structures and Algorithms"):nth-of-type(1)')).toHaveText("Data Structures and Algorithms");
    await expect(page.locator('text=Web Development')).toHaveText("Web Development");
})