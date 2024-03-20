// App.tsx
import { useState } from "react";
import "./App.css";
import MyDropzone from "./MyDropzone"; // Ensure this path is correct

function App() {
  const [gpxData, setGpxData] = useState<any>(null);

  const handleFileUploaded = (data: any) => {
    console.log("GPX Data:", data);
    setGpxData(data);
  };

  return (
    <div className="App">
      <MyDropzone onFileUploaded={handleFileUploaded} />
      <pre>{JSON.stringify(gpxData, null, 2)}</pre>
    </div>
  );
}

export default App;
