const EmblemVaultSDK = require('../dist/bundle.js');
const puppeteer = require('puppeteer');

describe('EmblemVaultSDK Browser Tests', () => {
  test('fetchCuratedContracts retrieves data', async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Inject the SDK script into the page
    await page.addScriptTag({ path: require.resolve('../dist/bundle.js') });

    // Execute SDK methods in the page context
    const contracts = await page.evaluate(async () => {
      const sdk = new EmblemVaultSDK('valid_api_key');
      return sdk.fetchCuratedContracts();
    });

    expect(contracts).toBeInstanceOf(Array);
    await page.close();
    await browser.close();
  });
});