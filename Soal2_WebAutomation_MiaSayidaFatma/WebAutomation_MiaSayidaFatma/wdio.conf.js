exports.config = {
    runner: 'local',
    specs: ['./features/curaHealthcare/**/*.feature'],
    maxInstances: 1,
    capabilities: [{ browserName: 'chrome' }],
    logLevel: 'warn',
    baseUrl: 'https://katalon-demo-cura.herokuapp.com',
    waitforTimeout: 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 2,
    framework: 'cucumber',
    reporters: ['spec'],
    cucumberOpts: {
        require: ['./features/step-definitions/**/*.js'],
        timeout: 60000,
        backtrace: false,
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: true,
        tagExpression: ''
    }
};
