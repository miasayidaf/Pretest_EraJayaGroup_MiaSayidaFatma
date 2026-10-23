# MobileAutomation_MiaSayidaFatma — Eraspace Login

## Soal 3 — Automation Script Mobile

Mobile login automation for **Eraspace Android**, using the **same coding approach** as the uploaded `WebAutomation_MiaSayidaFatma`: JavaScript/CommonJS, WebdriverIO, Cucumber BDD/Gherkin, Page Object Model, step definitions, Node `assert`, and spec reporter. Mobile device automation uses Appium + UiAutomator2 instead of Chrome browser automation.

## Test cases

| TC ID | Type | Test scenario | Expected result |
|---|---|---|---|
| 1.1 | Negative | Invalid username and password, tap Login | Login fails; visible error message |
| 1.2 | Positive | Valid username and password, tap Login | Login succeeds; homepage, menu list, account name, points displayed |

Feature: `features/eraspace/login.feature`.

## Prerequisites (Windows)

1. Install Node.js, Android Studio/Android SDK Platform Tools, Java JDK, and Appium 2.
2. Start an Android emulator or connect an Android phone with USB debugging enabled. Check `adb devices`.
3. Install Eraspace from the Play Store on the device, or obtain its APK **legitimately**. Use Android for this project (not iOS).
4. Have an **authorized test account** with valid credentials and a logged-out app session.
5. Inspect the actual Eraspace app using **Appium Inspector** to determine resource IDs / accessibility IDs for all login and post-login elements. UI selectors **cannot be verified** from the web-automation ZIP or screenshot.

## Install

```bash
npm install
npx appium driver install uiautomator2
cp .env.example .env
```

Edit `.env`: supply `APP_PACKAGE` (the real installed Eraspace package ID) **or** `APP_PATH` (APK path), `VALID_USERNAME`, and `VALID_PASSWORD`. Do not commit `.env`. Use `adb shell pm list packages` to discover the installed app package.

Update `config/locators.json` with actual selectors from Appium Inspector. Existing selectors are **illustrative candidates**, not confirmed selectors. For best reliability, prefer Android `resource-id` or accessibility ID over visible text. If the home screen requires tapping an account tab to reveal name or points, adjust page object navigation to match the actual app.

## Run

Open **two terminals** from the project folder.

Terminal 1:
```bash
npm run appium
```

Terminal 2:
```bash
npm run doctor
npm run test:login:negative
npm run test:login:positive
# or both scenarios (requires handling logout/reset between tests)
npm run test:login
```

The positive test changes login state; to rerun or run both scenarios reliably, log out before the next scenario or implement an app-specific logout/reset using confirmed locators. `noReset: true` intentionally avoids deleting app data.

Screenshots are saved to `evidence/` after each scenario (not committed by default). The `spec` reporter prints test steps and failures to terminal.

## Project structure

```text
MobileAutomation_MiaSayidaFatma/
├── features/
│   ├── eraspace/login.feature
│   ├── pageobjects/eraspace.page.js
│   └── step-definitions/eraspace.steps.js
├── config/locators.json
├── config/locators.example.json
├── scripts/check-setup.js
├── evidence/
├── .env.example
├── .gitignore
├── wdio.conf.js
└── package.json
```

## Important limitations

This is an **executable automation project scaffold**, not a verified passing run on Eraspace. The user-provided source project is **web automation** and does not contain Eraspace mobile selectors, app package, or authorized valid credentials. Those must be supplied and verified on an actual Android device. UI flows may vary by app version and login method (password vs OTP); if OTP is required, the scenario must be adapted to an authorized test flow. **Do not fabricate test results.**

## GitHub

Create a GitHub repository and upload the project files, excluding `.env`, APK, `node_modules`, and private account data. Include real screenshots/results only after running the test. Repository URL must be added by the owner; it cannot be generated locally.
