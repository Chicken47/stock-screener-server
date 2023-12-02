import express from "express";
import bodyParser from "body-parser";
import stockRoutes from "./routes/routes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 6969;

// middleware for the JSON
app.use(bodyParser.json());
app.use(cors());

app.use("/v1", stockRoutes);

// start the saver
app.listen(PORT, () => {
  console.log(`Stock Screener server is running on ${PORT}`);
});
