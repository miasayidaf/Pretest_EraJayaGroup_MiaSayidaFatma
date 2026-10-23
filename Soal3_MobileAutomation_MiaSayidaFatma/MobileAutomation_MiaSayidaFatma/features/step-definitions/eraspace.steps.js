const { Given, When, Then } = require('@wdio/cucumber-framework');
const eraspace = require('../pageobjects/eraspace.page.js');

Given('User is on the Eraspace mobile login page', async () => { await eraspace.openLogin(); });
When('User inputs invalid username', async () => { await eraspace.inputUsername(process.env.INVALID_USERNAME); });
When('User inputs invalid password', async () => { await eraspace.inputPassword(process.env.INVALID_PASSWORD); });
When('User inputs valid username', async () => { await eraspace.inputUsername(process.env.VALID_USERNAME); });
When('User inputs valid password', async () => { await eraspace.inputPassword(process.env.VALID_PASSWORD); });
When('User taps the Login button', async () => { await eraspace.tapLogin(); });
Then('User fails to login on Eraspace', async () => { await eraspace.verifyLoginFailed(); });
Then('an Eraspace login error message is displayed', async () => { await eraspace.verifyErrorMessage(); });
Then('User login successfully on Eraspace', async () => { await eraspace.verifyLoginSuccess(); });
Then('User is redirected to the Eraspace homepage', async () => { await eraspace.verifyHome(); });
Then('User can see the menu list', async () => { await eraspace.verifyMenuList(); });
Then('User can see the account name', async () => { await eraspace.verifyAccountName(); });
Then('User can see the point list', async () => { await eraspace.verifyPointList(); });