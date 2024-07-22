const { test, expect } = require("@playwright/test");

test("Question page can be accessed through course page", async({ page }) => {
    await page.goto("/courses?id=1");
    await page.locator('text=How to use loops?').click();
    expect(await page.title()).toBe("Question");
})

test("Question page functions properly", async({ page }) => {
    await page.goto("/questions?id=2");
    expect(await page.title()).toBe("Question");
    await expect(page.locator('text=How to use loops?')).toHaveText("How to use loops?");
    await expect(page.locator('text=Discuss different types of loops and their usage.')).toHaveText("Discuss different types of loops and their usage.");
    await expect(page.locator('text=Your answer')).toHaveText("Your answer");
    await expect(page.locator('text=Answers')).toHaveText("1 Answers");
    await expect(page.locator('text=Loops are used for repeating a block of code until a certain condition is met.')).toHaveText("Loops are used for repeating a block of code until a certain condition is met.");
})