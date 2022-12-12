const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await page.emulateTimezone("Asia/Calcutta");

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
//   );
//   await page.setExtraHTTPHeaders({
//     "Content-Type": "text/html;charset=ISO-8859-1",
//   });

  await page.goto("https://www.niftyindices.com/reports/historical-data", {
    waitUntil: "networkidle0",
  });

  await delay(2000);

  const historicalMenu = await page.waitForSelector(`#HistoricalMenu`);
  historicalMenu.click();
  console.log("Menu clicked");
  await delay(2000);
  console.log("Processing trilink");

  const triLink = await page.waitForSelector(`#mCSB_1_container > li.form5`);
  console.log(triLink);
  triLink.click();
  console.log("Processing Equity dropdown");
  await delay(5000);

  await page.select("#ddlHistoricalreturntypee", "Equity");
  await delay(2000);
  await page.select("#ddlHistoricalreturntypeeindex", "NIFTY 50");
  await delay(2000);

  return;
})();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}