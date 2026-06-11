import { test, expect } from "@playwright/test";

test("トップページが正しく表示されること", async ({ page }) => {
  await page.goto("http://localhost:3000/staff/login");
  await page.getByRole("textbox", { name: "ログインID" }).click();
  await page.getByRole("textbox", { name: "ログインID" }).fill("S2021001");
  await page.getByRole("textbox", { name: "ログインID" }).press("Tab");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page.getByText("日付選択")).toBeVisible();
});
