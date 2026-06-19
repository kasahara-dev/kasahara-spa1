import { test, expect, Page, Locator } from "@playwright/test";

test("保護者情報編集", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: /ID/ }).click();
  await page.getByRole("textbox", { name: /ID/ }).fill("202401001");
  await page.getByRole("textbox", { name: "パスワード" }).fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("http://localhost:3000");
  await expect(page.getByRole("heading", { name: "予定" })).toBeVisible();
  const profileLink = page.getByRole("link", { name: "保護者情報編集" });
  await profileLink.scrollIntoViewIfNeeded();
  await profileLink.click();
  await expect(page).toHaveURL("http://localhost:3000/profile");
  // メール1
  const email1Input = page.getByPlaceholder("example1@example.com");
  await expect(email1Input).toHaveValue(/@/);
  const email1Container = email1Input.locator("xpath=..");
  const isMac = process.platform === "darwin";
  const modifier = isMac ? "Meta" : "Control";
  await email1Container.getByPlaceholder("example1@example.com").click();
  await page.keyboard.press(`${modifier}+A`);
  await page.keyboard.press("Backspace");
  await email1Container
    .getByPlaceholder("example1@example.com")
    .fill("");
  await expect(email1Input).toHaveValue("");
  await email1Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await expect(page.getByText("この項目は必須です")).toBeVisible();
  await email1Container
    .getByPlaceholder("example1@example.com")
    .fill("update1@example.com");
  await email1Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, email1Container);
  await expect(email1Input).toHaveValue("update1@example.com");
  // メール2
  const email2Input = page.getByPlaceholder("example2@example.com");
  const email2Container = email2Input.locator("xpath=..");
  await email2Container.getByPlaceholder("example2@example.com").fill("");
  await email2Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, email2Container);
  await expect(page.getByText("この項目は必須です")).not.toBeVisible();
  await email2Container
    .getByPlaceholder("example2@example.com")
    .fill("update2@example.com");
  await email2Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, email2Container);
  await expect(email2Input).toHaveValue("update2@example.com");
  // メール3
  const email3Input = page.getByPlaceholder("example3@example.com");
  const email3Container = email3Input.locator("xpath=..");
  await email3Container.getByPlaceholder("example3@example.com").fill("");
  await email3Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, email3Container);
  await expect(page.getByText("この項目は必須です")).not.toBeVisible();
  await email3Container
    .getByPlaceholder("example3@example.com")
    .fill("update3@example.com");
  await email3Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, email3Container);
  await expect(email3Input).toHaveValue("update3@example.com");
  // 電話番号1
  const tel1Input = page.getByPlaceholder("090-1234-5678");
  const tel1Container = tel1Input.locator("xpath=..");
  await tel1Container.getByPlaceholder("090-1234-5678").fill("");
  await tel1Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await expect(page.getByText("この項目は必須です")).toBeVisible();
  await tel1Container
    .getByPlaceholder("090-1234-5678")
    .fill("111-1111-1111");
  await tel1Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, tel1Container);
  await expect(tel1Input).toHaveValue("111-1111-1111");
  // 電話番号2
  const tel2Input = page.getByPlaceholder("03-1234-5678");
  const tel2Container = tel2Input.locator("xpath=..");
  await tel2Container.getByPlaceholder("03-1234-5678").fill("");
  await tel2Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, tel2Container);
  await expect(page.getByText("この項目は必須です")).not.toBeVisible();
  await tel2Container.getByPlaceholder("03-1234-5678").fill("222-2222-2222");
  await tel2Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, tel2Container);
  await expect(tel2Input).toHaveValue("222-2222-2222");
  // 電話番号3
  const tel3Input = page.getByPlaceholder("050-1234-5678");
  const tel3Container = tel3Input.locator("xpath=..");
  await tel3Container.getByPlaceholder("050-1234-5678").fill("");
  await tel3Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, tel3Container);
  await expect(page.getByText("この項目は必須です")).not.toBeVisible();
  await tel3Container.getByPlaceholder("050-1234-5678").fill("333-3333-3333");
  await tel3Container
    .getByRole("button", { name: "更新", exact: true })
    .click();
  await waitForUpdateCompletion(page, tel3Container);
  await expect(tel3Input).toHaveValue("333-3333-3333");
  // 更新確認
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(email1Input).toHaveValue("update1@example.com");
  await expect(email2Input).toHaveValue("update2@example.com");
  await expect(email3Input).toHaveValue("update3@example.com");
  await expect(tel1Input).toHaveValue("111-1111-1111");
  await expect(tel2Input).toHaveValue("222-2222-2222");
  await expect(tel3Input).toHaveValue("333-3333-3333");
});
async function waitForUpdateCompletion(page: Page, container: Locator) {
  const updateBtn = container.getByRole("button");
  await expect(updateBtn).not.toContainText("完了");
  await expect(updateBtn).toBeEnabled();
}
