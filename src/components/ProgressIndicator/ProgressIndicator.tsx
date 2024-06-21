import React, { useEffect, useState } from "react";
import "./ProgressIndicator.css";

interface ProgressIndicatorProps {
  text: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 10); // Small delay to trigger the transition

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`progress-indicator-overlay ${visible ? "visible" : ""}`}>
      <div className="progress-indicator-content">
        <div className="spinner"></div>
        <div>{text}</div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
