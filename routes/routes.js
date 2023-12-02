import express from "express";
import searchStock from "../handlers/searchStocks.js";
import getStockData from "../handlers/getStockData.js";
import timeSeriesStockData from "../handlers/timeSeriesStock.js";
import timeSeriesPriceToEarningData from "../handlers/getPriceToEarning.js";

const stockRoutes = express.Router();

stockRoutes.post("/search", searchStock);

stockRoutes.post("/getStockData", getStockData);

stockRoutes.post("/timeSeriesStockData", timeSeriesStockData);

stockRoutes.post("/timeSeriesPriceToEarningData", timeSeriesPriceToEarningData);

export default stockRoutes;
