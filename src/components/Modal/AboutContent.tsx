import "./Modal.css";

const AboutContent = () => {
  return (
    <div className="about-content">
      <h4>
        Hi! Ianis here. Thank you for coming and trying out the GPX Time
        Planner.
      </h4>

      <h3>Overview</h3>
      <p>
        This application is designed for analyzing and manipulating GPX (GPS
        Exchange Format) data to help you plan and predict travel times for
        different travel modes. Created out of personal interest and for
        educational purposes, this app is primarily aimed at enhancing React
        skills. It leverages the Open Elevation API for accurate elevation data
        and the react-leaflet library for interactive map visualizations.
      </p>
      <h3>Key Features</h3>
      <ul>
        <li>
          <strong>GPX Data Analysis</strong>:
          <ul>
            <li>
              Load and parse GPX files to extract waypoints, tracks, and
              segments.
            </li>
            <li>
              Calculate travel times based on different travel modes (e.g.,
              walking, cycling, driving).
            </li>
          </ul>
        </li>
        <li>
          <strong>Elevation Data Integration</strong>:
          <ul>
            <li>
              Fetch elevation data for track points using the{" "}
              <a href="https://open-elevation.com/" target="_blank">
                Open Elevation API
              </a>
              .
            </li>
            <li>
              Interpolate missing elevation points to ensure accurate slope
              calculations.
            </li>
          </ul>
        </li>
        <li>
          <strong>Slope and Curve Calculations</strong>:
          <ul>
            <li>
              Calculate slopes between track points to determine elevation
              changes.
            </li>
            <li>
              Compute curve radii for segments to understand the curvature of
              the path.
            </li>
          </ul>
        </li>
        <li>
          <strong>Travel Time Modifiers</strong>:
          <ul>
            <li>Adjust travel times based on stop times at via waypoints.</li>
            <li>
              Apply multipliers to travel durations between waypoints to account
              for predicted extra heaviness of segments due to factors like
              local surface quality.
            </li>
          </ul>
        </li>
        <li>
          <strong>Interactive Map</strong>:
          <ul>
            <li>
              Visualize GPX tracks and waypoints using the{" "}
              <code>react-leaflet</code> library.
            </li>
            <li>
              Interactively explore the route and inspect details of each
              segment and waypoint.
            </li>
          </ul>
        </li>
      </ul>
      <h3>What You Can Do with This App</h3>
      <ul>
        <li>
          <strong>Analyze Your GPX Routes</strong>: Upload your GPX files to
          analyze the tracks and waypoints. Get detailed information about
          elevation changes, slopes, and curves along the route.
        </li>
        <li>
          <strong>Predict Travel Times</strong>: Use different travel modes to
          predict how long it will take to traverse your route. Adjust travel
          times based on stop durations and route segment heaviness.
        </li>
        <li>
          <strong>Map Visualization</strong>: View your routes on an interactive
          map. Zoom in and out to inspect specific segments, waypoints, and
          elevation changes.
        </li>
      </ul>
      <h3>Steps to create GPX file with timestamps on the Waypoint titles</h3>
      <ul>
        <li>
          <strong>Upload a GPX File</strong>: Use the button in the app header
          to upload your prepared GPX file. If the GPX file is large and lacks
          elevation data, it may take some time to parse and fetch the necessary
          data before displaying it on the map and listing the waypoints.
        </li>
        <li>
          <strong>Choose a Travel Type</strong>: Select your preferred travel
          type, which will determine properties such as your average speed,
          power, and agility.
        </li>
        <li>
          <strong>Adjust the Severity of Road Segments</strong>: If you are
          familiar with the quality of the roads and can predict additional
          travel time due to adverse conditions, use the provided buttons to
          adjust the duration multiplier for those segments.
        </li>
        <li>
          <strong>Adjust Stop times</strong>: In the waypoint list or by
          clicking on waypoints on the map, use the stop duration sliders to
          plan your stops at each waypoint. Ensure the total travel time aligns
          with your desired schedule.
        </li>
        <li>
          <strong>Download the GPX File</strong>: Once you have finished
          planning, download the GPX file. This file will include arrival and
          departure times added to your waypoint titles.
        </li>
      </ul>
      <h3>Technologies Used</h3>
      <ul>
        <li>
          <strong>
            <a href="https://reactjs.org/" target="_blank">
              React
            </a>
          </strong>
          : For building the user interface.
        </li>
        <li>
          <strong>
            <a href="https://react-leaflet.js.org/" target="_blank">
              react-leaflet
            </a>
          </strong>
          : For interactive map visualizations.
        </li>
        <li>
          <strong>
            <a href="https://open-elevation.com/" target="_blank">
              Open Elevation API
            </a>
          </strong>
          : For fetching elevation data.
        </li>
        <li>
          <strong>
            <a href="https://www.typescriptlang.org/" target="_blank">
              TypeScript
            </a>
          </strong>
          : For type-safe development.
        </li>
        <li>
          <strong>
            <a href="https://axios-http.com/" target="_blank">
              Axios
            </a>
          </strong>
          : For making API requests.
        </li>
      </ul>

      <p>
        This app serves as a robust tool for personal route planning and
        educational purposes, providing insights into the geographical and
        elevation aspects of your GPX data.
      </p>
      <h3>Support the Project</h3>
      <p>
        If you find this app useful or have suggestions for new features, please
        consider supporting the project. Your feedback and contributions are
        highly appreciated.
      </p>
      <ul>
        <li>
          <strong>Suggest Features & Report Bugs</strong>: Have an idea for a
          new feature or if you encounter any issues or bugs? Let me know! Your
          feedback can help improve the app.{" "}
          <a
            href="https://chat.whatsapp.com/F7y1m1NBcEg0YiUwzV7S9R"
            target="_blank"
            rel="noopener noreferrer"
          >
            Whatsapp group for issues/features
          </a>
        </li>
        <li>
          <strong>Donate</strong>: If you would like to support me coffecup, you
          can send donations via PayPal to{" "}
          <a href="https://paypal.me/JanisGrinvalds?country.x=LV&locale.x=en_US">
            @JanisGrinvalds
          </a>
          . Your support is greatly appreciated!
        </li>
      </ul>
    </div>
  );
};

export default AboutContent;
