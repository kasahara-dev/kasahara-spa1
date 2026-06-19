import { test, expect } from "@playwright/test";

test("スタッフログイン", async ({ page }) => {
  await page.goto("http://localhost:3000/staff");
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.goto("http://localhost:3000/staff/messages");
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.goto("http://localhost:3000/staff/groups");
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.getByRole("textbox", { name: /ID/ }).fill("S2021001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff");
  await expect(page.getByText("日付選択")).toBeVisible();
  await page.clock.resume();
  await page.waitForTimeout(100);
  await page.addStyleTag({
    content: "nextjs-portal { pointer-events: none !important; }",
  });
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.goto("http://localhost:3000/staff/groups");
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
});
