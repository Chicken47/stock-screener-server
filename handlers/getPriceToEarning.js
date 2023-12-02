/*Price to earning ratio - 
    https://www.screener.in/api/company/1298/chart/?q=Price-DMA50-DMA200-Volume&days=365&consolidated=true
    https://www.screener.in/api/company/1298/chart/?q=Price+to+Earning-Median+PE-EPS&days=1825&consolidated=true

*/

import axios from "axios";

// handle this similar to how the stock time series is handled
// replace some things in the url string and get the required one

// EXPECTED JSON IN THIS HANDLER
/*
        {
          "timeSeries": "30",
          "encodedSecret": "aHR0cHM6Ly93d3cuc2NyZWVuZXIuaW4vYXBpL2NvbXBhbnkvMzM2NS9jaGFydC8"
        }
  */

const timeSeriesPriceToEarningData = async (request, response) => {
  if (!request.body.timeSeries || !request.body.encodedSecret) {
    response.status(400);
  }
  const timeSeries = request.body.timeSeries;
  const encodedSecret = request.body.encodedSecret;
  const decodedUrl = Buffer.from(encodedSecret, "base64").toString("utf8");

  const peUrl = decodedUrl.replace(
    "Price-DMA50-DMA200-Volume&days=365",
    `Price+to+Earning-Median+PE-EPS&days=${timeSeries}`
  );
  let chartData;

  try {
    const axiosResponse = await axios.get(peUrl);
    chartData = axiosResponse.data;
    response.json(chartData);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  }
};

export default timeSeriesPriceToEarningData;
