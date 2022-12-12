const { MS_CRUD_URL, KMS_CRUD_URL, UPDATE_INAV_SCRIPT_URL } = require("./setup");
const { readMSCRUD, readKMSCRUD, sendErrorEmail, getDDMMYYYY } = require("./extraFunctionalities")
const { scrape_nse2 } = require("./nseScraper2");
const { default: axios } = require("axios");
const cron = require("croner");

async function start()
{
    try
	{
        console.log("Nifty Scraper started");
		const filters = [{ filterType: "simple" }];
		const last_inav_scraped_date_sheet_date = await readMSCRUD(MS_CRUD_URL, "last_inav_scraped_date", filters);
		
		const sectors = {};
		const sectors_for_proxy = {};
		last_inav_scraped_date_sheet_date.forEach((row) => {
			if(row['SET_PROXY'] == 'FALSE')
			{
				sectors[row['SECTOR']] = {
					LATEST_SCRAPED_DATE: row['LATEST_SCRAPED_DATE'],
					INVESTING: row['INVESTING'],
					NSE: row['NSE'],
					NSE_DROP_DOWN: row['NSE_DROP_DOWN']
				}
			}
			else if(row['SET_PROXY'] == 'TRUE')
			{
				sectors_for_proxy[row['SECTOR']] = {
					LATEST_SCRAPED_DATE: row['LATEST_SCRAPED_DATE']
				}
			}
		});

        console.log("Scraping from NSE");
		const nse_res = await scrape_nse2(sectors);

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
        
        const inav_data_obj = {};
        for(let key in sectors)
		{
            let data = [];
			inav_data_obj[key] = {};
			const curr_date = getDDMMYYYY(new Date().setHours(0,0,0,0));
			let todays_date = new Date().setHours(0,0,0,0);
			const last_scraped_date = new Date(sectors[key]['LATEST_SCRAPED_DATE']).setHours(0,0,0,0);
			let nse_inav_data = nse_data[key];

            while(todays_date >= last_scraped_date)
			{
				let dt = getDDMMYYYY(todays_date);
				if(nse_inav_data.hasOwnProperty(dt))
				{
                    inav_data_obj[key][dt] = nse_inav_data[dt];
                }
                else if(dt != curr_date && dt != getDDMMYYYY(last_scraped_date))
                {
					console.log("TRI Missed for this date: ",dt, " : ",key);
					let error = "TRI Missed for this date: "+dt+" : "+key;
					await sendErrorEmail(KMS_CRUD_URL, error);
                }
				todays_date = new Date(todays_date);
				todays_date = new Date(todays_date.setDate(todays_date.getDate() - 1)).setHours(0,0,0,0);
            }
        }

        //console.log("Filtering Data to send to Sheets");
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

		const missed_dates_for_proxy_tri = {};
		for(const key in sectors_for_proxy)
		{
			const missed_date_arr = [];
			const curr_sector = sectors_for_proxy[key];
			const curr_date = getDDMMYYYY(new Date().setHours(0,0,0,0));
			let todays_date = new Date().setHours(0,0,0,0);
			const last_scraped_date = new Date(curr_sector['LATEST_SCRAPED_DATE']).setHours(0,0,0,0);
			while(todays_date >= last_scraped_date)
			{
				let dt = getDDMMYYYY(todays_date);
				if(dt != curr_date && dt != getDDMMYYYY(last_scraped_date))
				{
					missed_date_arr.push(dt);
				}
				todays_date = new Date(todays_date);
				todays_date = new Date(todays_date.setDate(todays_date.getDate() - 1)).setHours(0,0,0,0);
			}
			
			missed_dates_for_proxy_tri[key] = missed_date_arr;
		}

		const sectorProxyTriChange = await readKMSCRUD(KMS_CRUD_URL, missed_dates_for_proxy_tri);
		
		for(const sector in sectorProxyTriChange)
		{
			rowData[sector] = sectorProxyTriChange[sector];
		}

		console.log(rowData);
		
		console.log("Sending data to INAV Sheet");
		// axios.post(UPDATE_INAV_SCRIPT_URL, {
		// 	type: "inav_data_update",
		// 	data: rowData
		// });
		console.log("Execution Completed");
    }
    catch(error)
    {
        console.log("Error occurred in start: ",error.message);
		await sendErrorEmail(KMS_CRUD_URL, error.message);
    }
}

// cron("05 10 * * *", async () => {
// 	start();
// },
// {
// 	timezone: "Asia/Kolkata"
// });
start();