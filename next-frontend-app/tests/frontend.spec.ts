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
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.goto("http://localhost:3000/staff/groups");
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
});

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

test("保護者ログインバリデーション", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.goto("http://localhost:3000/messages");
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.goto("http://localhost:3000/profile");
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/}).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).click();
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await expect(page.getByText("予定")).toBeVisible();
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  await page.goto("http://localhost:3000/profile");
  await expect(page).toHaveURL("http://localhost:3000/login");
});

test("保護者ページ遷移", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await page.getByRole("link", { name: "メッセージ履歴" }).click();
  await expect(page).toHaveURL("http://localhost:3000/messages");
  await page.getByRole("link", { name: "園児1さん" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await page.getByRole("link", { name: "保護者情報編集" }).click();
  await expect(page).toHaveURL("http://localhost:3000/profile");
});

test("予定登録", async ({ page, context }) => {
  await context.addInitScript(() => {
    const mockDateMillis = new Date("2026-12-01T10:00:00").getTime();
    const OriginalDate = window.Date;
    window.Date = new Proxy(OriginalDate, {
      construct(target, args) {
        if (args.length === 0) {
          return new target(mockDateMillis);
        }
        return Reflect.construct(target, args);
      },
    });
  });
  await page.goto("http://localhost:3000/staff/login");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff/login");
  await page.getByRole("textbox", { name: /ID/ }).fill("S2021001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff");
  await expect(page.getByText("日付選択")).toBeVisible();
  await page
    .getByRole("button", { name: "2026年12月16日水曜日" })
    .click({ force: true });
  await page
    .getByRole("button", { name: "新規予定の作成" })
    .click({ force: true });
  await page
    .getByRole("textbox", {
      name: /イベントタイトル/,
    })
    .fill("テストタイトル");
  await page
    .getByRole("textbox", { name: /イベント詳細/ })
    .fill("テスト詳細");
  await page.getByRole("button", { name: "予定を登録する" }).click();
  await page.locator("div").filter({ hasText: "テストタイトル" }).nth(5).click();
  await expect(page.getByText("テストタイトル")).toBeVisible();
  await expect(page.getByText("テスト詳細")).toBeVisible();
  await expect(page.getByText("最終更新者: 管理者1")).toBeVisible();
});

test("出欠", async ({ page, context }) => {
  await context.addInitScript(() => {
    const mockDateMillis = new Date("2026-12-01T10:00:00").getTime();
    const OriginalDate = window.Date;
    window.Date = new Proxy(OriginalDate, {
      construct(target, args) {
        if (args.length === 0) {
          return new target(mockDateMillis);
        }
        return Reflect.construct(target, args);
      },
    });
  });
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
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
  // 遅刻その他
  await page.getByRole("textbox", { name: /理由を/ }).fill("遅刻詳細");
  await expect(page.locator("span", { hasText: "遅刻その他" })).toBeVisible();
  // お休み
  await page.getByRole("radio", { name: "お休み" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.locator("span", { hasText: "お休み" })).toBeVisible();
  // 出席
  await page.getByRole("radio", { name: "出席" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.locator("span", { hasText: "出席" })).toBeVisible();
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL("http://localhost:3000/login");
  // スタッフ側からも確認
  await page.goto("http://localhost:3000/staff/login");
  await page.getByRole("textbox", { name: /ID/ }).fill("S2021001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000/staff");
  await expect(page.getByText("日付選択")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "2026年12月16日水曜日" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "2026年12月16日水曜日" })
    .click({ force: true });
  await expect(page.getByText("園児1")).not.toBeVisible();
  // 遅刻その他
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
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText(/詳細を入力してください/)).toBeVisible();
  await page
    .getByRole("textbox", { name: "理由を200字以内で入力してください" })
    .fill("遅刻詳細");
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("出欠等連絡詳細")).not.toBeVisible();
  await expect(page.getByText("園児1")).toBeVisible();
  await expect(page.getByText("遅刻詳細")).toBeVisible();
  // 欠席
  await page.getByRole("heading", { name: "園児1" }).click();
  await page.getByRole("radio", { name: "お休み" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("出欠等連絡詳細")).not.toBeVisible();
  await expect(page.getByText("園児1")).toBeVisible();
  // 出席
  await page.getByRole('heading', { name: '園児1' }).click();
  await page.getByRole("radio", { name: "出席" }).click();
  await page.getByRole("button", { name: "変更を保存する" }).click();
  await expect(page.getByText("出欠等連絡詳細")).not.toBeVisible();
  await expect(page.getByText("園児1")).not.toBeVisible();
});

test("保護者情報編集", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await page.getByRole("link", { name: "保護者情報編集" }).click();
  await expect(page).toHaveURL("http://localhost:3000/profile");
  const email1Input = page.getByPlaceholder("example1@example.com");
  await expect(email1Input).toHaveValue(/@/);
  await email1Input.fill("");
  await page
    .locator("div")
    .filter({ hasText: "メールアドレス 1" })
    .getByRole("button", { name: "更新" })
    .first()
    .click();
  await expect(page.getByText("この項目は必須です")).toBeVisible();
});
