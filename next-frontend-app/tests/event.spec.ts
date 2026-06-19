import { test, expect } from "@playwright/test";

test("行事登録", async ({ page }) => {
  await page.goto("http://localhost:3000/staff/login");
  await page.waitForLoadState("networkidle");

  const idInput = page.getByRole("textbox", { name: /ID/ });
  const passwordInput = page.getByRole("textbox", { name: "パスワード" });

  await idInput.fill("S2021001");
  await passwordInput.fill("password");

  await expect(idInput).toHaveValue("S2021001");
  await expect(passwordInput).toHaveValue("password");

  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("http://localhost:3000/staff", {
    timeout: 10000,
  });

  await page.clock.setFixedTime(new Date("2026-12-01T10:00:00"));
  await Promise.all([page.reload(), page.waitForLoadState("networkidle")]);

  await expect(page.getByText("日付選択")).toBeVisible();

  const dateButton = page.getByRole("button", { name: "2026年12月16日水曜日" });
  await dateButton.waitFor({ state: "visible" });
  await dateButton.click();
  await expect(page.getByText("12月16日(水) 欠席等連絡")).toBeVisible({
    timeout: 10000,
  });
  await page.waitForLoadState("networkidle");
  await page.getByRole("heading", { name: "日付選択" }).click();
  const createPlanBtn = page.getByRole("button", { name: "新規予定の作成" });
  await expect(createPlanBtn).toBeVisible();
  await createPlanBtn.click({ force: true });

  const modal = page.getByText("予定の新規登録");
  await expect(modal).toBeVisible({ timeout: 10000 });

  await page
    .getByRole("textbox", { name: /イベントタイトル/ })
    .fill("テストタイトル");
  await page.getByRole("textbox", { name: /イベント詳細/ }).fill("テスト詳細");
  await page.getByRole("button", { name: "予定を登録する" }).click();

  await expect(modal).not.toBeVisible({ timeout: 10000 });

  const targetEvent = page.locator("main").getByText("テストタイトル").first();
  await expect(targetEvent).toBeVisible({ timeout: 15000 });

  await targetEvent.click();
  await expect(page.getByText("テスト詳細")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("最終更新者: 管理者1")).toBeVisible();
});
