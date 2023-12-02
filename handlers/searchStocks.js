import axios from "axios";

// handler to search the stock required
const searchStock = async (request, response) => {
  // get the string that is entered in the frontend
  if (!request.body.searchQuery) {
    response.status(400);
  }
  const searchQuery = request.body.searchQuery;
  console.log("hahahahahaha", request.body);
  let searchResponse;

  // call the search API with query string that we recieve from above
  try {
    const axiosResponse = await axios.get(
      `https://www.screener.in/api/company/search/?q=${searchQuery}`
    );
    searchResponse = axiosResponse.data;
    response.json(searchResponse);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  }
  console.log("hello", JSON.stringify(searchResponse));
};

export default searchStock;
