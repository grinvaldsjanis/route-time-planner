import React, { useState, useRef, useEffect } from "react";
import "./Menu.css"
import { FaBars, FaCircleXmark, FaUpload, FaDownload } from "react-icons/fa6";
import { useGlobalState } from "../../context/GlobalContext";
import {
  clearPreviousData,
  setIsProgrammaticMove,
  stopPlayback,
} from "../../context/actions";
import { handleDownloadGPX } from "../../utils/download";

const Menu: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClearData = () => {
    if (state.isPlaying) {
      dispatch(stopPlayback());
    }
    dispatch(clearPreviousData());
    dispatch(setIsProgrammaticMove(false));
  };

  const handleDownload = () => {
    console.log("Download button clicked");

    if (state.isPlaying) {
      dispatch(stopPlayback());
    }

    const { gpxData, startTime } = state;
    const gpxName = gpxData?.gpxName || "My Journey";

    handleDownloadGPX(gpxData, startTime, gpxName, dispatch);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="menu" ref={menuRef}>
      <div className="menu-links">
        <button
          type="button"
          className="menu-link upload-link"
          onClick={() => {
            document.getElementById("file-upload-input")?.click();
          }}
        >
          <FaUpload /> Upload GPX
        </button>
        {state.gpxData && (
          <>
            <button
              type="button"
              className="menu-link download-link"
              onClick={handleDownload}
            >
              <FaDownload /> Download GPX
            </button>
            <button
              type="button"
              className="menu-link clear-link"
              onClick={handleClearData}
            >
              <FaCircleXmark /> Clear Data
            </button>
          </>
        )}
      </div>

      <button
        className="hamburger-menu"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {isMenuOpen && (
        <div className="dropdown-menu show">
          <button
            type="button"
            className="menu-link upload-link"
            onClick={() => {
              document.getElementById("file-upload-input")?.click();
            }}
          >
            <FaUpload /> Upload GPX
          </button>
          {state.gpxData && (
            <>
              <button
                type="button"
                className="menu-link download-link"
                onClick={handleDownload}
              >
                <FaDownload /> Download GPX
              </button>
              <button
                type="button"
                className="menu-link clear-link"
                onClick={handleClearData}
              >
                <FaCircleXmark /> Clear Data
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Menu;
