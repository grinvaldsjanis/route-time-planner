async function fetchCommonsImage(
    lat: string,
    lon: string,
    maxSize: number = 800
  ): Promise<string | null> {
    try {
      // Step 1: Search for media files near the given coordinates
      const geoSearchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}|${lon}&ggsradius=10000&ggslimit=1&ggsnamespace=6&prop=imageinfo&iiprop=thumbnail|url&iiurlwidth=${maxSize}&format=json&origin=*`;
      console.log(`Querying URL: ${geoSearchUrl}`);
      
      const geoSearchResponse = await fetch(geoSearchUrl);
      const geoSearchData = await geoSearchResponse.json();
  
      if (!geoSearchData.query || Object.keys(geoSearchData.query.pages).length === 0) {
        console.log("No nearby pages found");
        return null; // No nearby media files found
      }
  
      const pageKey = Object.keys(geoSearchData.query.pages)[0];
      const page = geoSearchData.query.pages[pageKey];
  
      if (page.imageinfo) {
        const imageUrl = page.imageinfo[0].thumburl;
        const imageWidth = page.imageinfo[0].thumbwidth;
  
        console.log(`Found image with width: ${imageWidth}px, URL: ${imageUrl}`);
  
        // Return the image if it's smaller than the specified maxSize
        if (imageWidth <= maxSize) {
          return imageUrl;
        } else {
          console.log("Image is larger than the specified size limit");
          return null;
        }
      } else {
        console.log("No image info available for the page");
        return null;
      }
    } catch (error) {
      console.error("Error fetching Wikimedia Commons image:", error);
      return null;
    }
  }
  
  export default fetchCommonsImage;
  