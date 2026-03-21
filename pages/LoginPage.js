import { getUiBaseUrl } from '../utils/urls';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
  }

  async goto() {
    await this.page.goto(getUiBaseUrl());
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async dismissError() {
    await this.errorCloseButton.click();
  }
}

