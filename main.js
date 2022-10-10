const { MS_CRUD_URL, UPDATE_INAV_SCRIPT_URL } = require("./setup");
const { readMSCRUD, getDDMMYYYY } = require("./extraFunctionalities")
const { scrape_nse } = require("./nseScraper");
const { scrape_investing } = require("./investingScraper");

async function start()
{
	const filters = [{ filterType: "simple" }];
	const last_inav_scraped_date_sheet_date = await readMSCRUD(MS_CRUD_URL, "last_inav_scraped_date", filters);
	
	const sectors = {};
	last_inav_scraped_date_sheet_date.forEach((row) => {
		sectors[row['SECTOR']] = {
			LATEST_SCRAPED_DATE: row['LATEST_SCRAPED_DATE'],
			INVESTING: row['INVESTING'],
			NSE: row['NSE'],
			NSE_DROP_DOWN: row['NSE_DROP_DOWN']
		}
	});
	
	console.log("Scraping from NSE");
	const nse_res = await scrape_nse(sectors);
	const nse_data = {};
	for(let key in nse_res)
	{
		let sect_data = nse_res[key];
		let prev_tri = 0;
		let data = {};
		for(let i=0; i<sect_data.length;i++)
		{
			if(i==0)
			{
				prev_tri = sect_data[i]['inav'];
				continue;
			}
			let per_change = ((sect_data[i]['inav']-prev_tri)/prev_tri)*100;
			per_change = (Math.round((per_change + Number.EPSILON) * 100) / 100) + "%";
			let dt = getDDMMYYYY(sect_data[i]['date']);
			data[dt] = per_change;
			prev_tri = sect_data[i]['inav'];
		}
		nse_data[key] = data;
	}

	console.log("Scraping from Investing.com");
	const investing_res = await scrape_investing(sectors);

	const inav_data_obj = {};
	for(let key in sectors)
	{
		let data = [];
		inav_data_obj[key] = {};
		let todays_date = new Date().setHours(0,0,0,0);
		const last_scraped_date = new Date(sectors[key]['LATEST_SCRAPED_DATE']).setHours(0,0,0,0);
		let nse_inav_data = nse_data[key];
		let investing_inav_data = investing_res[key];
		
		while(todays_date >= last_scraped_date)
		{
			let dt = getDDMMYYYY(todays_date);
			if(nse_inav_data.hasOwnProperty(dt))
			{
				if(investing_inav_data.hasOwnProperty(dt))
				{
					if(nse_inav_data[dt] != investing_inav_data[dt]) // diff greater than 0.005
					{
						let diff = Math.abs((parseFloat(nse_inav_data[dt].substring(0,nse_inav_data[dt].length-1))) - (parseFloat(investing_inav_data[dt].substring(0,investing_inav_data[dt].length-1))));
						if(diff > 0.005)
						{
							console.log("Big diff, Send email");
							console.log("Error !!!!");
							console.log(dt, " : ", diff);
							console.log((nse_inav_data[dt].substring(0,nse_inav_data[dt].length-1)));
							console.log((investing_inav_data[dt].substring(0,investing_inav_data[dt].length-1)));
						}
						else
						{
							inav_data_obj[key][dt] = nse_inav_data[dt];
						}
					}
					else
					{
						inav_data_obj[key][dt] = investing_inav_data[dt];
					}
				}
				else
				{
					inav_data_obj[key][dt] = nse_inav_data[dt];
				}
			}
			else if(investing_inav_data.hasOwnProperty(dt))
			{
				inav_data_obj[key][dt] = investing_inav_data[dt];
			}
			todays_date = new Date(todays_date);
			todays_date = new Date(todays_date.setDate(todays_date.getDate() - 1)).setHours(0,0,0,0);
		}
	}


	console.log("Filtering Data to send to Sheets");
	const rowData = {};
	for(let key in inav_data_obj)
	{
		let rows = [];
		let secObj = inav_data_obj[key];
		for(let key in secObj)
		{
			let row = {
				date: key,
				percentChange: secObj[key]
			}
			rows.push(row);
		}
		rowData[key] = rows;
	}
	console.log(rowData);

	// axios.post(UPDATE_INAV_SCRIPT_URL, {
	// 	type: "tr_change",
	// 	data: filteredData
	// });

}

start();