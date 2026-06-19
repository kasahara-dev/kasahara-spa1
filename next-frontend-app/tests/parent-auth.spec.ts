import { test, expect } from "@playwright/test";

test("保護者ログイン", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.goto("http://localhost:3000/messages");
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.goto("http://localhost:3000/profile");
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).click();
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("http://localhost:3000");
  await expect(page.getByText("予定")).toBeVisible();
  await page.clock.resume();
  await page.waitForTimeout(100);
  await page.addStyleTag({
    content: "nextjs-portal { pointer-events: none !important; }",
  });
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.goto("http://localhost:3000/profile");
  await expect(page).toHaveURL("http://localhost:3000/login");
});
