require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const deviceName = process.env.DEVICE_NAME || 'Android Emulator';
const platformVersion = process.env.PLATFORM_VERSION;
const apk = process.env.APP_PATH ? path.resolve(process.env.APP_PATH) : null;
const appPackage = process.env.APP_PACKAGE;
const appActivity = process.env.APP_ACTIVITY;
if (!apk && !appPackage) throw new Error('Set APP_PATH to Eraspace APK or APP_PACKAGE to installed app package in .env');
if (apk && !fs.existsSync(apk)) throw new Error(`APP_PATH not found: ${apk}`);
const capability = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': deviceName,
  'appium:autoGrantPermissions': true,
  'appium:noReset': true,
  'appium:newCommandTimeout': 120,
  ... (platformVersion ? {'appium:platformVersion': platformVersion} : {}),
  ... (process.env.UDID ? {'appium:udid': process.env.UDID} : {}),
  ... (apk ? {'appium:app': apk} : {}),
  ... (appPackage ? {'appium:appPackage': appPackage} : {}),
  ... (appActivity ? {'appium:appActivity': appActivity} : {})
};
exports.config = {
  runner: 'local',
  hostname: '127.0.0.1', port: 4723, path: '/',
  specs: ['./features/eraspace/**/*.feature'],
  maxInstances: 1,
  capabilities: [capability],
  logLevel: 'warn', waitforTimeout: 20000,
  connectionRetryTimeout: 120000, connectionRetryCount: 1,
  framework: 'cucumber', reporters: ['spec'],
  cucumberOpts: {
    require: ['./features/step-definitions/**/*.js'],
    timeout: 120000, backtrace: false, dryRun: false,
    failFast: false, snippets: true, source: true,
    tagExpression: ''
  },
  beforeScenario: async () => {
    if (appPackage) {
      try { await browser.activateApp(appPackage); } catch (e) { console.warn(`activateApp: ${e.message}`); }
    }
  },
  afterScenario: async (_world, _result) => {
    const dir = path.join(__dirname, 'evidence');
    fs.mkdirSync(dir, {recursive:true});
    const name = `login-${Date.now()}.png`;
    try { await browser.saveScreenshot(path.join(dir,name)); } catch(e) { console.warn('Screenshot unavailable:', e.message); }
  }
};
