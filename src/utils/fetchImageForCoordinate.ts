export default async function fetchImageForCoordinate(
  coord: { lat: string; lon: string },
  maxSize: number
): Promise<{ imageUrl: string | null }> {
  const requestKey = `${coord.lat}-${coord.lon}`;

  try {
    // console.log(`Initiating image fetch for: ${requestKey}`);

    const params = {
      action: "query",
      generator: "geosearch",
      ggscoord: `${coord.lat}|${coord.lon}`,
      ggsradius: "10000",
      ggslimit: "1",
      ggsnamespace: "6",
      prop: "imageinfo",
      iiprop: "thumbnail|url",
      iiurlwidth: maxSize.toString(),
      format: "json",
    };

    const url = `https://commons.wikimedia.org/w/api.php?origin=*&${new URLSearchParams(
      params
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data?.query?.pages) {
      const pageKeys = Object.keys(data.query.pages);
      if (pageKeys.length > 0) {
        const page = data.query.pages[pageKeys[0]];
        if (page.imageinfo?.[0]?.thumburl) {
          return { imageUrl: page.imageinfo[0].thumburl };
        }
      }
    }

    console.warn(`No image found for: ${requestKey}`);
    return { imageUrl: null };
  } catch (error) {
    console.error(`Error fetching image for: ${requestKey}`, error);
    return { imageUrl: null };
  }
}
