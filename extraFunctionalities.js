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
		dd = dd < 10 ? "0" + dd : dd;
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

module.exports = {
    readMSCRUD,
    getDDMMYYYY,
    getDDMMYYYY_for_nse,
    delay
}