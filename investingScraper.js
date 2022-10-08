const puppeteer = require("puppeteer");

async function scrape_investing(sectors)
{
	try
	{
		const browser = await puppeteer.launch({
			headless: true, // false temporarily
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		const filteredData = {};
		for (let key in sectors) // looping through urls
		{
			const url = sectors[key]['INVESTING'];
			const etfData = {};
			const page = await browser.newPage();
			// Configure the navigation timeout
			await page.setDefaultNavigationTimeout(0);
			await page.goto(url, { waitUntil: "networkidle0" });
			await page.setViewport({ width: 1400, height: 768 });

			const result = await page.$$eval(".common-table.medium.js-table tr",(rows) => {
				return Array.from(rows, (row) => {
					const columns = row.querySelectorAll("td");
					return Array.from(columns, (column) => column.innerText);
				});
			});

			result.shift();

			result.forEach((row) => {
				const date = row[0];
				const percentChange = row[row.length - 1];
				etfData[date] = percentChange;
				//etfData.push({ date, percentChange });
			});

			filteredData[key] = etfData;
			//appends data into object sector as key and data
		}
		await browser.close();
		return filteredData;
	}
	catch(error)
	{
		console.log("Error occurred in scrape_investing() investingScraper.js: ",error.message);
	}
}

module.exports = {
    scrape_investing
}