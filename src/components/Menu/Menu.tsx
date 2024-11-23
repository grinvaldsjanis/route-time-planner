import React, { useState, useRef, useEffect } from "react";
import "./Menu.css";
import { FaBars, FaCircleXmark, FaUpload, FaDownload } from "react-icons/fa6";
import { useGlobalState } from "../../context/GlobalContext";
import { clearPreviousData, setIsProgrammaticMove } from "../../context/actions";

const Menu: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClearData = () => {
    dispatch(clearPreviousData());
    dispatch(setIsProgrammaticMove(false));
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
        <a
          href="#"
          className="menu-link upload-link"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("file-upload-input")?.click();
          }}
        >
          <FaUpload /> Upload GPX
        </a>
        {state.gpxData && (
          <>
            <a
              href="#"
              className="menu-link download-link"
              onClick={(e) => {
                e.preventDefault();
                const downloaderElement = document.getElementById("download-link");
                downloaderElement?.click();
              }}
            >
              <FaDownload /> Download GPX
            </a>
            <a
              href="#"
              className="menu-link clear-link"
              onClick={(e) => {
                e.preventDefault();
                handleClearData();
              }}
            >
              <FaCircleXmark /> Clear Data
            </a>
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
          <a
            href="#"
            className="menu-link upload-link"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("file-upload-input")?.click();
            }}
          >
            <FaUpload /> Upload GPX
          </a>
          {state.gpxData && (
            <>
              <a
                href="#"
                className="menu-link download-link"
                onClick={(e) => {
                  e.preventDefault();
                  const downloaderElement = document.getElementById("download-link");
                  downloaderElement?.click();
                }}
              >
                <FaDownload /> Download GPX
              </a>
              <a
                href="#"
                className="menu-link clear-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleClearData();
                }}
              >
                <FaCircleXmark /> Clear Data
              </a>
            </>
          )}
        </div>
      )}

    </nav>
  );
};

export default Menu;
