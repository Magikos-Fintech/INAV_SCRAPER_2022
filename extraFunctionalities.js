const { default: axios } = require("axios");

async function readMSCRUD(url, s_name, filters) //used for reading data from a sheet
{
	try
	{
		const { data } = await axios.post(url, {
			s_name: s_name,
			type: "read",
			filters: filters
		});
		return data.response_data;
	}
	catch(error)
	{
		console.log("Error occurred in readMSCRUD() extraFunctionality.js: ",error.message);
	}
}

async function readKMSCRUD(url, missed_dates_for_proxy_tri) //used for reading data from a sheet
{
	try
	{
		const { data } = await axios.post(url, {
			missed_dates_for_proxy_tri: missed_dates_for_proxy_tri,
			type: "fetch"
		});
		return data;
	}
	catch(error)
	{
		console.log("Error occurred in readKMSCRUD() extraFunctionality.js: ",error.message);
	}
}

async function sendErrorEmail(url, error) //used for reading data from a sheet
{
	try
	{
		await axios.post(url, {
			error: error,
			type: "email_error"
		});
	}
	catch(error)
	{
		console.log("Error occurred in readKMSCRUD() extraFunctionality.js: ",error.message);
	}
}

function getDDMMYYYY(dt) // converts date/date string to Mar 17, 1999
{
	try
	{
		dt = new Date(dt);
		const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		let dd = dt.getDate();
		dd = dd < 10 ? "0" + dd : dd;
		let mm = months[dt.getMonth()];
		let yyyy = dt.getFullYear();
		return mm + " " + dd + ", " + yyyy;
	}
	catch(error)
	{
		console.log("Error occurred in getDDMMYYYY() extraFunctionality.js: ",error.message);
	}
}

function getDDMMYYYY_for_nse(dt) // converts date/date string to 17-03-1999
{
	try
	{
		dt = new Date(dt);
		let dd = dt.getDate();
		// dd = dd < 10 ? "0" + dd : dd;
		let mm = dt.getMonth() + 1;
		mm = mm < 10 ? "0" + mm : mm;
		let yyyy = dt.getFullYear();
		return dd + "-" + mm + "-" + yyyy;
	}
	catch(error)
	{
		console.log("Error occurred in getDDMMYYYY_for_nse() extraFunctionality.js: ",error.message);
	}
}

function delay(time) // used to stop functionality for perticular time
{
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
}

function extractSelectorFromHTMLCode(TABLE_HTML, date) // gets selector for particular date
{
	let requiredTable = TABLE_HTML.substring(
		TABLE_HTML.indexOf('<tbody>'),
		TABLE_HTML.indexOf("</tbody>")+8
	);

	let count_rows = (requiredTable.match(/<tr/g) || []).length;

	let tableData = [];
	let selector_string = "#ui-datepicker-div > table > tbody > ";
	for(let i=0; i<count_rows; i++)
	{
		//looping through table rows
		let startIndex = requiredTable.indexOf('<tr>');
		let endIndex = requiredTable.indexOf("</tr>")+5;
		var tr = requiredTable.substring(startIndex, endIndex);

		let count_cols = (tr.match(/<td/g) || []).length;

		let rawTdData = [];
		for(let j=0; j<8; j++)
		{
			// looping through row columns i.e. td
			let statIndex2 = tr.indexOf('<td');
			let endIndex2 = tr.indexOf("</td>")+5;
			var td = tr.substring(statIndex2, endIndex2);
			
			let statIndex3 = td.indexOf('<a');
			let endIndex3 = td.indexOf("</a>")+5;
			a = td.substring(statIndex3, endIndex3);

			let statIndex4 = a.indexOf('href="#">')+9;
			let endIndex4 = a.indexOf("</a>");
			let atext = a.substring(statIndex4, endIndex4);

			if(atext == date)
			{
				selector_string += 'tr:nth-child('+(i+1)+')  > td:nth-child('+(j+1)+')';
				rawTdData.push(a);
			}

			tr = tr.substring(0,statIndex2) + tr.substring(endIndex2);
		}

		let cleanedTdData = rawTdData; // extracting data throgh raw table data

		requiredTable = requiredTable.substring(0,startIndex) + requiredTable.substring(endIndex);
	}
	return selector_string;
}

module.exports = {
    readMSCRUD,
	readKMSCRUD,
	sendErrorEmail,
    getDDMMYYYY,
    getDDMMYYYY_for_nse,
    delay,
	extractSelectorFromHTMLCode
}