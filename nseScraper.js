const { getDDMMYYYY, getDDMMYYYY_for_nse, delay } = require("./extraFunctionalities");
const puppeteer = require("puppeteer");

async function scrape_nse(sectors)
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
			sd = new Date(sd.setDate(sd.getDate() - 1));
			let ed = new Date();
			let start_date = getDDMMYYYY_for_nse(sd);
			let end_date = getDDMMYYYY_for_nse(ed);

			const url = sectors[key]['NSE'];
			const dd_value = sectors[key]['NSE_DROP_DOWN'];
		
			const page = await browser.newPage();
			await page.setUserAgent(
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
			);
			await page.setExtraHTTPHeaders({
				"Content-Type": "text/html;charset=ISO-8859-1",
			});
			await page.goto(url, { waitUntil: "networkidle0" });
			await page.select("select#indexType", dd_value);
			await page.focus("#fromDate");
			await page.keyboard.type(start_date);
			await page.focus("#toDate");
			await page.keyboard.type(end_date);
			await page.$eval("#get", (el) => el.click());
			await page.waitForSelector("#replacetext table");

			let result = await page.$$eval("#replacetext table tbody tr", (rows) => {
				return Array.from(rows, (row) => {
					const columns = row.querySelectorAll("td");
						return Array.from(columns, (column) => column.innerText);
				});
			});
			result.shift();
			result.shift();
			result.pop();
			result.forEach((row) => {
				const date = row[0];
				const inav = row[row.length - 1];
				inav_data.push({ date, inav });
			});

			nse_data[key] = inav_data;
			await delay(3000);
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
    scrape_nse
}