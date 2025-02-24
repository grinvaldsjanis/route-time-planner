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
    }, 10);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`progress-indicator-overlay ${visible ? "visible" : ""}`}>
      <div className="progress-indicator-content">
        <div className="loader"></div>
        <div className="loader-text">{text}</div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
