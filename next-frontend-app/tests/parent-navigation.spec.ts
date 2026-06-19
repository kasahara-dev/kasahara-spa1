import { test, expect } from "@playwright/test";

test("保護者ページ遷移", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).click();
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await expect(page.getByRole("textbox", { name: /ID/ })).toHaveValue(
    "202401001",
  );
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  const heading = page.getByRole("heading", { name: "予定" });
  await expect(heading).toBeVisible();
  const messageLink = page.getByRole("link", {
    name: "メッセージ履歴",
    exact: true,
  });
  await messageLink.scrollIntoViewIfNeeded();
  await messageLink.click({ position: { x: 5, y: 5 } });
  await expect(page).toHaveURL("http://localhost:3000/messages");
  await page.getByRole("link", { name: "園児1さん" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await page
    .getByRole("link", { name: "保護者情報編集" })
    .click({ force: true });
  await expect(page).toHaveURL("http://localhost:3000/profile");
});
