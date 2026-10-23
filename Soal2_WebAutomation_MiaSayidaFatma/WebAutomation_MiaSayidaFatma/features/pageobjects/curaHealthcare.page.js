const assert = require('node:assert/strict');

class CuraHealthcarePage {
    get usernameField() { return $('#txt-username'); }
    get passwordField() { return $('#txt-password'); }
    get loginButton() { return $('#btn-login'); }
    get errorMessage() { return $('.text-danger'); }
    get appointmentTitle() { return $('section#appointment h2'); }
    get facilityDropdown() { return $('#combo_facility'); }
    get hospitalReadmissionCheckbox() { return $('#chk_hospotal_readmission'); }
    get commentField() { return $('#txt_comment'); }
    get visitDateField() { return $('#txt_visit_date'); }
    get bookAppointmentButton() { return $('#btn-book-appointment'); }
    get confirmationTitle() { return $('#summary h2'); }

    async openCURAHealthcare() {
        await browser.url('/profile.php#login');
        await this.usernameField.waitForDisplayed();
    }

    async inputUsername(username) {
        await this.usernameField.setValue(username);
        assert.equal(await this.usernameField.getValue(), username);
    }

    async inputPassword(password) {
        await this.passwordField.setValue(password);
        assert.equal(await this.passwordField.getValue(), password);
    }

    async clickLoginButton() { await this.loginButton.click(); }

    async verifyFailsToLogin() {
        await this.errorMessage.waitForDisplayed();
        assert.equal(new URL(await browser.getUrl()).hash, '#login');
    }

    async verifyInvalidLogin(message) {
        assert.equal((await this.errorMessage.getText()).trim(), message);
    }

    async verifyLoginSuccessfully() {
        await this.appointmentTitle.waitForDisplayed();
        assert.equal((await this.appointmentTitle.getText()).trim(), 'Make Appointment');
    }

    async verifyMakeAppointmentPage() {
        await browser.waitUntil(async () => new URL(await browser.getUrl()).hash === '#appointment',
            { timeout: 15000, timeoutMsg: 'Make Appointment page was not opened' });
        await this.appointmentTitle.waitForDisplayed();
    }

    async selectFacility(facility) {
        await this.facilityDropdown.selectByVisibleText(facility);
        assert.equal(await this.facilityDropdown.$('option:checked').getText(), facility);
    }

    async checkHospitalReadmission() {
        if (!(await this.hospitalReadmissionCheckbox.isSelected())) {
            await this.hospitalReadmissionCheckbox.click();
        }
        assert.equal(await this.hospitalReadmissionCheckbox.isSelected(), true);
    }

    async selectHealthcareProgram(program) {
        const ids = { Medicare: '#radio_program_medicare', Medicaid: '#radio_program_medicaid', None: '#radio_program_none' };
        assert.ok(ids[program], `Unknown healthcare program: ${program}`);
        const radio = $(ids[program]);
        await radio.click();
        assert.equal(await radio.isSelected(), true);
    }

    async inputComment(comment) {
        await this.commentField.setValue(comment);
        assert.equal(await this.commentField.getValue(), comment);
    }

    async selectVisitDateDaysFromToday(days) {
        const date = new Date();
        date.setDate(date.getDate() + Number(days));
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        // CURA Healthcare datepicker displays dates in dd/mm/yyyy format.
        const visitDate = `${dd}/${mm}/${yyyy}`;
        await this.visitDateField.setValue(visitDate);
        await this.commentField.click(); // dismiss the calendar popup
        assert.equal(await this.visitDateField.getValue(), visitDate);
        return visitDate;
    }

    async clickBookAppointment() { await this.bookAppointmentButton.click(); }

    async verifyVisitDateRequired() {
        assert.equal(await this.visitDateField.getValue(), '');
        const validation = await browser.execute(() => {
            const field = document.querySelector('#txt_visit_date');
            return { required: field.required, valueMissing: field.validity.valueMissing,
                message: field.validationMessage };
        });
        assert.equal(validation.required, true, 'Visit Date should be required');
        assert.equal(validation.valueMissing, true, 'Visit Date should be missing');
        assert.ok(validation.message, 'Native validation message should be shown');
        assert.equal(new URL(await browser.getUrl()).hash, '#appointment');
    }

    async verifyConfirmationPage() {
        await this.confirmationTitle.waitForDisplayed();
        assert.equal((await this.confirmationTitle.getText()).trim(), 'Appointment Confirmation');
        assert.equal(new URL(await browser.getUrl()).hash, '#summary');
    }

    async verifyConfirmationValue(selector, expected) {
        assert.equal((await $(selector).getText()).trim(), expected);
    }
}

module.exports = new CuraHealthcarePage();