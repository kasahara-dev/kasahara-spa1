import { test, expect } from "@playwright/test";

test("スタッフページ遷移", async ({ page }) => {
  await page.goto("http://localhost:3000/staff/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/ }).fill("S2021001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("http://localhost:3000/staff");
  await page.getByRole("link", { name: "メッセージ" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff/messages");
  await page.getByRole("link", { name: "連絡先一覧" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff/groups");
});