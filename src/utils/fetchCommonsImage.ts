import { setInProgress } from "../context/actions";

// Utility function to construct URL with parameters
function constructUrl(baseUrl: string, params: { [key: string]: string | number }): string {
  let url = `${baseUrl}?origin=*`;
  Object.keys(params).forEach((key) => {
    url += `&${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
  });
  return url;
}

// Function to fetch image for a given coordinate with dispatch
async function fetchImageForCoordinate(
  coord: { lat: string; lon: string },
  maxSize: number,
  dispatch: (action: any) => void
): Promise<{ key: string; imageUrl: string | null }> {
  const params = {
    action: "query",
    generator: "geosearch",
    ggscoord: `${coord.lat}|${coord.lon}`,
    ggsradius: 10000,
    ggslimit: 1,
    ggsnamespace: 6,
    prop: "imageinfo",
    iiprop: "thumbnail|url",
    iiurlwidth: maxSize,
    format: "json",
  };

  const url = constructUrl("https://commons.wikimedia.org/w/api.php", params);
  console.log(`Querying URL: ${url}`);

  dispatch(setInProgress(true, `Fetching image for coordinate\n(${coord.lat}, ${coord.lon})...`));

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.query) {
      const pageKey = Object.keys(data.query.pages)[0];
      const page = data.query.pages[pageKey];
      if (page.imageinfo) {
        dispatch(setInProgress(true, `Image found for coordinate\n(${coord.lat}, ${coord.lon}).`));
        return {
          key: `${coord.lat},${coord.lon}`,
          imageUrl: page.imageinfo[0].thumburl,
        };
      }
    }
    dispatch(setInProgress(true, `No image found for coordinate\n(${coord.lat}, ${coord.lon}).`));
    return { key: `${coord.lat},${coord.lon}`, imageUrl: null };
  } catch (error) {
    console.error(`Error fetching image for ${coord.lat},${coord.lon}:`, error);
    dispatch(setInProgress(true, `Error fetching image for coordinate\n(${coord.lat}, ${coord.lon}).`));
    return { key: `${coord.lat},${coord.lon}`, imageUrl: null };
  }
}

// Main function to fetch images for all coordinates with dispatch
async function fetchCommonsImages(
  coordinates: { lat: string; lon: string }[],
  maxSize: number = 800,
  maxConcurrentRequests: number = 5, // Limit for concurrent requests
  dispatch: (action: any) => void
): Promise<{ [key: string]: string | null }> {
  const results: { [key: string]: string | null } = {};

  const fetchBatch = async (batch: { lat: string; lon: string }[]) => {
    const promises = batch.map((coord) => fetchImageForCoordinate(coord, maxSize, dispatch));
    const batchResults = await Promise.all(promises);

    batchResults.forEach(({ key, imageUrl }) => {
      results[key] = imageUrl;
    });
  };

  // Handle limited concurrency
  for (let i = 0; i < coordinates.length; i += maxConcurrentRequests) {
    const batch = coordinates.slice(i, i + maxConcurrentRequests);
    dispatch(setInProgress(true, `Fetching batch\n${i / maxConcurrentRequests + 1}...`));
    await fetchBatch(batch);
  }

  return results;
}

export default fetchCommonsImages;
