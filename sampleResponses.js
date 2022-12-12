const missed_dates = {
    n50: [ 'Nov 02, 2022', 'Nov 01, 2022' ],
    n20: [ 'Nov 02, 2022', 'Nov 01, 2022' ]
}

const rowData = {
    n50: [ { date: 'Nov 03, 2022', percentChange: '-0.17%' } ],
    n20: [ { date: 'Nov 03, 2022', percentChange: '-0.63%' } ] 
};

const sectors_for_proxy = { slv: { LATEST_SCRAPED_DATE: '10/31/2022' } };

const missed_dates_for_proxy_tri = { slv: [ 'Nov 03, 2022', 'Nov 02, 2022', 'Nov 01, 2022' ] };

const sectorProxyTriChange = {
    slv: [
        { date: 'Nov 01, 2022', percentChange: 4.3485646339392 },    
        { date: 'Nov 02, 2022', percentChange: -0.7656967840735107 },
        { date: 'Nov 03, 2022', percentChange: -2.400548696844995 }
    ]
}

const sectors = {
    n50: {
      LATEST_SCRAPED_DATE: '11/30/2022',
      INVESTING: 'https://in.investing.com/indices/nifty-total-returns-historical-data',
      NSE: 'https://www1.nseindia.com/products/content/equities/indices/historical_total_return.htm',
      NSE_DROP_DOWN: 'NIFTY 50'
    },
    n20: {
      LATEST_SCRAPED_DATE: '11/30/2022',
      INVESTING: 'https://in.investing.com/indices/nv20-historical-data',
      NSE: 'https://www1.nseindia.com/products/content/equities/indices/historical_total_return.htm',
      NSE_DROP_DOWN: 'NIFTY50 VALUE 20'
    }
}

const nse_res = {
    n50: [
      { date: '07 Dec 2022', inav: '26988.31' },
      { date: '06 Dec 2022', inav: '27107.87' },
      { date: '05 Dec 2022', inav: '27192.64' },
      { date: '02 Dec 2022', inav: '27185.44' }
    ],
    n20: [
      { date: '07 Dec 2022', inav: '12389.97' },
      { date: '06 Dec 2022', inav: '12399.43' },
      { date: '05 Dec 2022', inav: '12457.16' },
      { date: '02 Dec 2022', inav: '12424.06' }
    ]
}