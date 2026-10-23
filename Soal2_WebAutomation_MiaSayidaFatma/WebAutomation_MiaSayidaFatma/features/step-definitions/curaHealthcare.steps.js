const { Given, When, Then } = require('@wdio/cucumber-framework');
const cura = require('../pageobjects/curaHealthcare.page.js');
let enteredVisitDate;

Given('User is on the CURA Healthcare Service login page', async () => {
    enteredVisitDate = undefined;
    await cura.openCURAHealthcare();
});

When(/^User input (?:invalid|valid) username "([^"]*)"$/, async (username) => {
    await cura.inputUsername(username);
});

When(/^User input (?:invalid|valid) password "([^"]*)"$/, async (password) => {
    await cura.inputPassword(password);
});

When('User clicks the Login button', async () => { await cura.clickLoginButton(); });

Then('User fails to login', async () => { await cura.verifyFailsToLogin(); });

Then('the error message {string} is displayed', async (message) => {
    await cura.verifyInvalidLogin(message);
});

Then('User login successfully', async () => { await cura.verifyLoginSuccessfully(); });

Then('User is redirected to the Make Appointment page', async () => {
    await cura.verifyMakeAppointmentPage();
});

When('User selects facility {string}', async (facility) => { await cura.selectFacility(facility); });

When('User checks Apply for hospital readmission', async () => {
    await cura.checkHospitalReadmission();
});

When('User selects healthcare program {string}', async (program) => {
    await cura.selectHealthcareProgram(program);
});

When('User input comment {string}', async (comment) => { await cura.inputComment(comment); });

When(/^User selects a Visit Date (\d+) days from today$/, async (days) => {
    enteredVisitDate = await cura.selectVisitDateDaysFromToday(Number(days));
});

When('User clicks the Book Appointment button', async () => { await cura.clickBookAppointment(); });

Then('a validation message indicates that Visit Date is required', async () => {
    await cura.verifyVisitDateRequired();
});

Then('User is redirected to the Appointment Confirmation page', async () => {
    await cura.verifyConfirmationPage();
});

Then('Displayed facility is {string}', async (facility) => {
    await cura.verifyConfirmationValue('#facility', facility);
});

Then('Displayed hospital readmission is {string}', async (value) => {
    await cura.verifyConfirmationValue('#hospital_readmission', value);
});

Then('Displayed healthcare program is {string}', async (program) => {
    await cura.verifyConfirmationValue('#program', program);
});

Then('Displayed Visit Date matches the entered date', async () => {
    const assert = require('node:assert/strict');
    assert.ok(enteredVisitDate, 'Visit Date was not entered');
    await cura.verifyConfirmationValue('#visit_date', enteredVisitDate);
});

Then('Displayed comment is {string}', async (comment) => {
    await cura.verifyConfirmationValue('#comment', comment);
});