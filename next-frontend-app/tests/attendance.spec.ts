import { test, expect } from "@playwright/test";

test("出欠登録", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).click();
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await page.clock.setFixedTime(new Date("2026-12-01T10:00:00"));
  await page.reload();
  await expect(
    page.getByRole("button", { name: "2026年12月16日水曜日" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "2026年12月16日水曜日" })
    .click({ force: true });
  await page.getByRole("radio", { name: "遅刻その他" }).click();
  await page.getByRole("textbox", { name: /理由を/ }).fill("");
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("詳細を入力してください")).toBeVisible();
  await page.getByRole("textbox", { name: /理由を/ }).fill("遅刻詳細");
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.locator("span", { hasText: "遅刻その他" })).toBeVisible();
  await page.getByRole("radio", { name: "遅刻その他" }).click();
  await page.getByRole("textbox", { name: /理由を/ }).fill("");
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("詳細を入力してください")).toBeVisible();
  await page.getByRole("textbox", { name: /理由を/ }).fill("遅刻詳細");
  await expect(page.locator("span", { hasText: "遅刻その他" })).toBeVisible();
  await page.getByRole("radio", { name: "お休み" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.locator("span", { hasText: "お休み" })).toBeVisible();
  await page.getByRole("radio", { name: "出席" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.locator("span", { hasText: "出席" })).toBeVisible();
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  // スタッフ側からの確認フェーズ
  await page.clock.resume();
  await page.goto("http://localhost:3000/staff/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/ }).fill("S2021001");
  await page.getByRole("textbox", { name: "パスワード" }).click();
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff");
  await page.clock.setFixedTime(new Date("2026-12-01T10:00:00"));
  await page.reload();

  await expect(page.getByText("日付選択")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "2026年12月16日水曜日" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "2026年12月16日水曜日" })
    .click({ force: true });
  await expect(page.getByText("園児1")).not.toBeVisible();
  await page.getByRole("button", { name: "新規登録" }).click();
  await page.getByRole("button", { name: "全園児" }).click();
  await page.getByRole("button", { name: /全体/ }).click();
  await page.getByRole("button", { name: "園児1" }).click();
  await expect(page.getByRole("button", { name: "登録する" })).toBeEnabled();
  await page.getByRole("button", { name: "登録する" }).click();
  await expect(page.getByText("出欠連絡の新規登録")).not.toBeVisible();
  await expect(page.getByText("園児1")).toBeVisible();
  await page.getByRole("heading", { name: "園児1" }).click();
  await page.getByRole("radio", { name: "遅刻その他" }).click();
  await page
    .getByRole("textbox", { name: "理由を200字以内で入力してください" })
    .fill("");
  await page.getByRole("radio", { name: "遅刻その他" }).check();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  const errorMsg = page.getByText(/詳細を入力してください/);
  await expect(errorMsg).toBeVisible();
  await page
    .getByRole("textbox", { name: "理由を200字以内で入力してください" })
    .fill("遅刻詳細");
  await page.getByRole("radio", { name: "遅刻その他" }).check();
  await page
    .getByRole("button", { name: "変更を保存する" })
    .click({ force: true });
  const modal = page.getByText("出欠等連絡詳細");
  await expect(modal).not.toBeVisible({ timeout: 15000 });
  await expect(page.getByText("園児1")).toBeVisible();
  await expect(page.getByText("遅刻詳細")).toBeVisible({ timeout: 10000 });
  await page.getByRole("heading", { name: "園児1" }).click();
  await page.getByRole("radio", { name: "お休み" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("出欠等連絡詳細")).not.toBeVisible();
  await expect(page.getByText("園児1")).toBeVisible();
  await page.getByRole("heading", { name: "園児1" }).click();
  await page.getByRole("radio", { name: "出席" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("出欠等連絡詳細")).not.toBeVisible();
  await expect(page.getByText("園児1")).not.toBeVisible();
});
