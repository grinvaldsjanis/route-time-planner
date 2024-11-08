async function fetchWikipediaImage(
  lat: string,
  lon: string
): Promise<string | null> {
  try {
    const geoSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=5000&gslimit=1&format=json&origin=*`;
    const geoSearchResponse = await fetch(geoSearchUrl);
    const geoSearchData = await geoSearchResponse.json();

    if (geoSearchData.query.geosearch.length === 0) {
      return null;
    }

    const pageId = geoSearchData.query.geosearch[0].pageid;
    const pageImageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pageids=${pageId}&pithumbsize=500&format=json&origin=*`;
    const pageImageResponse = await fetch(pageImageUrl);
    const pageImageData = await pageImageResponse.json();

    const page = pageImageData.query.pages[pageId];
    return page.thumbnail ? page.thumbnail.source : null;
  } catch (error) {
    console.error("Error fetching Wikipedia image:", error);
    return null;
  }
}

export default fetchWikipediaImage;
