const EmblemVaultSDK = require('../dist/bundle.js');
const puppeteer = require('puppeteer');

describe('EmblemVaultSDK Browser Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.addScriptTag({ path: require.resolve('../dist/bundle.js') });
  }, 10_000);

  afterAll(async () => {
    await page.close();
    await browser.close();
  });

  test('fetchCuratedContracts retrieves data', async () => {
    const contracts = await page.evaluate(async () => {
      const sdk = new EmblemVaultSDK('valid_api_key');
      return sdk.fetchCuratedContracts();
    });

    expect(contracts).toBeInstanceOf(Array);
  }, 10_000);
});
