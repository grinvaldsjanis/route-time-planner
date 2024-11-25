import React from "react";
import "./Loading.css";

const Loading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>{text}</p>
    </div>
  );
};

export default Loading;
