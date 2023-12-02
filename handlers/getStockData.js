import puppeteer from "puppeteer";
import getIndianIndices from "./getIndianIndices.js";

const getStockData = async (request, response) => {
  if (!request.body.url) {
    response.status(400).json({ error: "Invalid request, missing URL" });
    return;
  }

  const url = request.body.url;

  const { financialData, newsDetails } = await getIndianIndices(url);

  try {
    const {
      stockChartResponse,
      aboutText,
      ratios,
      shareholding,
      quartersData,
      prosConsData,
      encodedSecret,
    } = await getStockChartAndTables(url);

    console.log("Stock Chart Response:", stockChartResponse);
    console.log("About Text:", aboutText);
    console.log("Ratios:", ratios);
    console.log("Shareholding:", shareholding);
    console.log("Scraped Data:", quartersData);
    console.log("Pros and Cons:", prosConsData);
    console.log("EncodedSecret:", encodedSecret);

    // You can send all values in the response as needed
    response.json({
      stockChartResponse,
      aboutText,
      ratios,
      shareholding,
      quartersData,
      prosConsData,
      encodedSecret,
      financialData,
      newsDetails,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  }
};

const getStockChartAndTables = async (screenerLink) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  let stockChartResponse;
  let aboutText;
  let ratios;
  let shareholding;
  let prosConsData;
  let encodedSecret;

  page.on("request", (request) => {
    const requestUrl = request.url();

    if (requestUrl.includes("/chart/")) {
      let chartUrl = requestUrl;
      console.log("Chart URL:", chartUrl);

      encodedSecret = Buffer.from(chartUrl).toString("base64");
      console.log("Base64 Encoded Chart URL:", encodedSecret);
    }

    request.continue();
  });

  page.on("response", async (response) => {
    if (
      response.url().includes("https://www.screener.in/api/company/") &&
      response.url().includes("/chart/")
    ) {
      stockChartResponse = await response.json();
    }
  });

  await page.goto(`https://screener.in${screenerLink}`);
  await page.waitForTimeout(500);

  // Get the maximum data for a stock

  // Get the About Text
  aboutText = await page.$eval(
    ".show-more-box.about > p",
    (p) => p?.textContent
  );

  // Get the basic Stock Data

  // Extract ratios from the HTML
  ratios = await page.$$eval("#top-ratios li", (ratiosList) => {
    return ratiosList.map((ratio) => {
      const name = ratio.querySelector(".name")?.textContent.trim();
      const value = ratio.querySelector(".value .number")?.textContent.trim();
      return { name, value };
    });
  });

  // Extract shareholding data within the section with id "shareholding" in the collapsed state
  shareholding = await page.evaluate(() => {
    const data = [];
    const shareholdingSection = document.querySelector(
      "#shareholding .responsive-holder .data-table"
    );

    const headers = shareholdingSection.querySelectorAll("thead th:not(.text)");
    const headerNames = Array.from(headers).map((header) =>
      header.textContent.trim()
    );

    const rows = shareholdingSection.querySelectorAll("tbody tr:not(.sub)");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const rowData = {
        category: cells[0]?.textContent.trim(),
      };

      headerNames.forEach((columnName, index) => {
        rowData[columnName] = cells[index + 1]?.textContent.trim(); // Skip the first cell (category)
      });

      data.push(rowData);
    });

    return data;
  });

  // Scrape the Quarters Data
  const quartersData = await page.evaluate(() => {
    const quartersSection = document.getElementById("quarters");
    const table = quartersSection.querySelector("table.data-table");

    if (!table) {
      return null; // No table found in the "quarters" section
    }

    const headings = Array.from(table.querySelectorAll("thead th"))
      .slice(1) // Skip the first empty heading
      .map((th) => th.textContent.trim());

    const rows = Array.from(table.querySelectorAll("tbody tr.strong"));
    const values = rows.map((row) => {
      const rowData = {
        category: row.querySelector("td.text")?.textContent.trim() || "",
        values: Array.from(row.querySelectorAll("td"))
          .slice(1)
          .map((td) => td.textContent.trim()),
      };
      return rowData;
    });

    const data = {
      headings,
      values,
    };

    return data;
  });

  // Scrape Pros and Cons
  prosConsData = await page.evaluate(() => {
    const pros = Array.from(document.querySelectorAll(".pros li")).map((li) =>
      li.textContent.trim()
    );
    const cons = Array.from(document.querySelectorAll(".cons li")).map((li) =>
      li.textContent.trim()
    );

    return { pros, cons };
  });

  await browser.close();
  return {
    stockChartResponse,
    aboutText,
    ratios,
    shareholding,
    quartersData,
    prosConsData,
    encodedSecret,
  };
};

export default getStockData;
