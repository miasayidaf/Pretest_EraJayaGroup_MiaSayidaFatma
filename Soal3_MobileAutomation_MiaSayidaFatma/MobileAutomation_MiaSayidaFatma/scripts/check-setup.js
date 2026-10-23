require('dotenv').config();
const {execFileSync}=require('node:child_process');
const keys=['APP_PATH','APP_PACKAGE','VALID_USERNAME','VALID_PASSWORD'];
for(const key of keys) console.log(`${key}: ${process.env[key] ? 'configured' : 'MISSING'}`);
try { console.log(execFileSync('adb',['devices'],{encoding:'utf8'})); } catch(e) { console.log('adb not available in PATH'); }
console.log('Appium server should listen on http://127.0.0.1:4723');
console.log('Inspect real UI and update config/locators.json before running tests.');
