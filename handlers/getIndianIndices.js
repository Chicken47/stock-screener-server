import puppeteer from "puppeteer";

function extractValue(link) {
  const patternWithConsolidated = /\/company\/(.*?)\/consolidated\//;
  const patternWithoutConsolidated = /\/company\/(.*?)\//;

  if (link?.includes("/consolidated/")) {
    const match = link?.match(patternWithConsolidated);
    return match ? match[1] : null;
  } else {
    const match = link?.match(patternWithoutConsolidated);
    return match ? match[1] : null;
  }
}

const getIndianIndices = async (screenerLink) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const listingName = extractValue(screenerLink);
  console.log(listingName, "listingName");

  // Navigate to the Google Finance page
  await page.goto(`https://www.google.com/finance/quote/${listingName}:NSE`);

  // Wait for the required elements to be present
  await page.waitForSelector(".lkR3Y");

  const newsDetails = await page.evaluate(() => {
    const elements = document.querySelectorAll(".yY3Lee");

    return Array.from(elements).map((el) => {
      const newsCompany = el.querySelector(".sfyJob").innerText;
      const time = el.querySelector(".Adak").innerText;
      const title = el.querySelector(".Yfwt5").innerText;
      const imgSrc = el.querySelector(".Z4idke")?.getAttribute("src");
      const linkToNews = el.querySelector(".z4rs2b a")?.getAttribute("href");

      return {
        newsCompany,
        time,
        title,
        imgSrc,
        linkToNews,
      };
    });
  });

  // Extract financial data
  const financialData = await page.evaluate(() => {
    const elements = document.querySelectorAll(".lkR3Y");

    return Array.from(elements).map((element) => {
      const name = element.querySelector(".pKBk1e")?.innerText;
      const value = element.querySelector(".YMlKec")?.innerText;
      const percentage = element.querySelector(".JwB6zf.V7hZne")?.innerText;

      return {
        name,
        value,
        percentage,
      };
    });
  });
  await browser.close();

  return { financialData, newsDetails };
};

export default getIndianIndices;
