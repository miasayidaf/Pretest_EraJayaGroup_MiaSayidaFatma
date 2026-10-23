const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const locators = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/locators.json'), 'utf8'));
class EraspacePage {
  async find(key, {required = true, timeout = 12000} = {}) {
    const candidates = locators[key] || [];
    for (const selector of candidates) {
      if (selector.includes('REPLACE_WITH_')) continue;
      try {
        const el = await $(selector);
        if (await el.isDisplayed()) return el;
      } catch (_) { /* try next selector */ }
    }
    if (required) throw new Error(`Locator '${key}' not found. Inspect Eraspace with Appium Inspector and update config/locators.json. Tried: ${candidates.join(' | ')}`);
    return null;
  }
  async waitFor(key, timeout = 20000) {
    let found;
    await browser.waitUntil(async () => { found = await this.find(key, {required:false}); return !!found; },
      {timeout, interval: 700, timeoutMsg: `Element '${key}' not displayed; update config/locators.json based on Appium Inspector`});
    return found;
  }
  async openLogin() {
    // Requires a logged-out test account/session. No destructive account reset is performed.
    const existing = await this.find('username', {required:false});
    if (!existing) {
      const entry = await this.find('loginEntry', {required:false});
      if (entry) await entry.click();
    }
    await this.waitFor('username');
    await this.waitFor('password');
  }
  async inputUsername(value) {
    assert.ok(value, 'Username test data is missing from .env');
    const field = await this.waitFor('username');
    await field.click(); await field.clearValue(); await field.setValue(value);
    assert.equal(await field.getText(), value, 'Username was not entered correctly');
  }
  async inputPassword(value) {
    assert.ok(value, 'Password test data is missing from .env');
    const field = await this.waitFor('password');
    await field.click(); await field.clearValue(); await field.setValue(value);
    // Password may be masked on mobile; do not log or compare its visible text.
    assert.equal(await field.isDisplayed(), true, 'Password field should remain visible');
  }
  async tapLogin() { await (await this.waitFor('loginButton')).click(); }
  async verifyLoginFailed() {
    await this.waitFor('errorMessage');
    assert.equal(!!(await this.find('homeMarker',{required:false})), false, 'Home unexpectedly visible after invalid login');
  }
  async verifyErrorMessage() {
    const element = await this.waitFor('errorMessage');
    const message = (await element.getText()).trim();
    assert.ok(message.length > 0, 'Error message is empty');
    if (process.env.EXPECTED_ERROR_TEXT) assert.ok(message.includes(process.env.EXPECTED_ERROR_TEXT), `Unexpected error message: ${message}`);
  }
  async verifyLoginSuccess() { await this.waitFor('homeMarker', 30000); }
  async verifyHome() { assert.equal(await (await this.waitFor('homeMarker')).isDisplayed(), true); }
  async verifyMenuList() { assert.equal(await (await this.waitFor('menuList')).isDisplayed(), true); }
  async verifyAccountName() {
    const element = await this.waitFor('accountName');
    const value = (await element.getText()).trim();
    assert.ok(value, 'Account name should not be empty');
    if (process.env.EXPECTED_ACCOUNT_NAME) assert.ok(value.includes(process.env.EXPECTED_ACCOUNT_NAME), `Account name mismatch: ${value}`);
  }
  async verifyPointList() { assert.equal(await (await this.waitFor('pointList')).isDisplayed(), true); }
}
module.exports = new EraspacePage();
