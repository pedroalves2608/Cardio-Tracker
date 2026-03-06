import { test, expect } from "@playwright/test";

async function waitForLoginForm(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /entrar/i }).waitFor({ state: "visible", timeout: 15000 });
}

async function waitForRegisterForm(page: import("@playwright/test").Page) {
  await page.goto("/register");
  await page.getByRole("button", { name: /Criar conta/i }).waitFor({ state: "visible", timeout: 15000 });
}

test.describe("Auth", () => {
  test("login redirects to /workouts when credentials are valid", async ({ page }) => {
    await waitForLoginForm(page);
    await page.locator("#user").fill("admin");
    await page.locator("#password").fill("admin");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/workouts/, { timeout: 15000 });
    await expect(page.getByText(/treinos/i).first()).toBeVisible();
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    await waitForLoginForm(page);
    await page.locator("#user").fill("wronguser");
    await page.locator("#password").fill("wrongpass");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/incorretos/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("create account then login", async ({ page }) => {
    const username = `e2e-${Date.now()}`;
    const password = "e2epass123";
    await waitForRegisterForm(page);
    await page.getByPlaceholder(/mínimo 2 caracteres/i).fill(username);
    await page.locator("#password").fill(password);
    await page.getByLabel(/confirmar/i).fill(password);
    await page.getByRole("button", { name: /Criar conta/i }).click();
    await expect(page).toHaveURL(/\/workouts/, { timeout: 15000 });
    await page.goto("/logout");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await waitForLoginForm(page);
    await page.locator("#user").fill(username);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/\/workouts/, { timeout: 10000 });
  });
});
