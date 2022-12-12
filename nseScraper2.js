const { getDDMMYYYY, getDDMMYYYY_for_nse, delay, extractSelectorFromHTMLCode } = require("./extraFunctionalities");
const puppeteer = require("puppeteer");

async function scrape_nse2(sectors)
{
	try
	{
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		let nse_data = {};

		for(let key in sectors)
		{
			let inav_data = [];
			let sd = new Date(getDDMMYYYY(sectors[key]['LATEST_SCRAPED_DATE']));
			let ed = new Date();
			let start_date = getDDMMYYYY_for_nse(sd);
			const url = sectors[key]['NSE'];

			const page = await browser.newPage();
			await page.emulateTimezone("Asia/Calcutta");
			await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36");
			
			await page.goto(url, { waitUntil: "networkidle0" });
			await delay(2000);

			const historicalMenu = await page.waitForSelector(`#HistoricalMenu`);
			historicalMenu.click();
			await delay(3000);
			
			const triLink = await page.waitForSelector(`#mCSB_1_container > li.form5`);
			triLink.click();
			await delay(3000);

			let before = await page.cookies();
			for await (const cookie of before)
			{
				await page.deleteCookie({
					name : cookie.name,
					domain : cookie.domain
				});
			}
			await delay(3000);

			await page.select("#ddlHistoricalreturntypee", "Equity");
			await delay(8000);
			await page.select("#ddlHistoricalreturntypeeindex", sectors[key]['NSE_DROP_DOWN']);
			await delay(8000);

			
			const dateForm = await page.waitForSelector(`#datepickerFromtotalindex`);
			dateForm.click();
			await delay(5000);

			//const datePickerHTML = await page.evaluate(() => document.querySelector(`#ui-datepicker-div > table`).outerHTML());
			
			let date = start_date.split('-')[0];
			let month = String(parseInt(start_date.split('-')[1])-1);
			let year = start_date.split('-')[2];

			await page.select("#ui-datepicker-div > div > div > select.ui-datepicker-year", year);
			await delay(5000);
			await page.select("#ui-datepicker-div > div > div > select.ui-datepicker-month", month);
			await delay(5000);

			const datePickerHTML = await page.$eval('#ui-datepicker-div > table', (element) => {
				return element.outerHTML
			});

			let dateSelector = await extractSelectorFromHTMLCode(datePickerHTML, date);
			const reqDate = await page.waitForSelector(dateSelector);
			reqDate.click();

			await delay(3000);
			before = await page.cookies();
			for await (const cookie of before)
			{
				await page.deleteCookie({
					name : cookie.name,
					domain : cookie.domain
				});
			}

			await page.$eval("#submit_totalindexhistorical", (el) => el.click());
			
			await delay(15000);

			let result = await page.$$eval("#historytotalindexexport tbody tr", (rows) => {
				return Array.from(rows, (row) => {
					const columns = row.querySelectorAll("td");
						return Array.from(columns, (column) => column.innerText);
				});
			});
			
			result.forEach((row) => {
				const date = row[0];
				const inav = row[row.length - 1];
				inav_data.push({ date, inav });
			});

			//console.log(inav_data);
			inav_data.sort((a,b)=> (new Date(a.date) > new Date(b.date) ? 1 : -1));
			nse_data[key] = inav_data;
			await delay(30000);
		}

		await browser.close();
		return nse_data;
	}
	catch(error)
	{
		console.log("Error occurred in scrape_nse() nseScraper.js: ",error.message);
	}
}

module.exports = {
    scrape_nse2
}