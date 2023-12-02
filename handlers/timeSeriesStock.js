import axios from "axios";

const timeSeriesStockData = async (request, response) => {
  // issue is that the chart url is in the other API handler.
  // this is how i am going to handle it.
  /*
        The getStockData API Handler is called on page load so:
        1. base64 encode the chartUrl in getStockData 
        2. send it to the frontend
        3. frontend stores it 
        4. on the click of a button it send the chartUrl and days
        5. call the the chart url with the required days 
        6. return required JSON
    */

  // EXPECTED JSON IN THIS HANDLER
  /*
        {
          "timeSeries": "30",
          "encodedSecret": "aHR0cHM6Ly93d3cuc2NyZWVuZXIuaW4vYXBpL2NvbXBhbnkvMzM2NS9jaGFydC8"
        }
    */

  if (!request.body.timeSeries || !request.body.encodedSecret) {
    response.status(400);
  }
  const timeSeries = request.body.timeSeries;
  const encodedSecret = request.body.encodedSecret;
  const decodedCharturl = Buffer.from(encodedSecret, "base64").toString("utf8");

  const url = decodedCharturl.replace(`days=365`, `days=${timeSeries}`);

  let chartData;

  try {
    const axiosResponse = await axios.get(url);
    chartData = axiosResponse.data;
    response.json(chartData);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  }
};

export default timeSeriesStockData;
