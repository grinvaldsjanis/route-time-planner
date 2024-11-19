import React, { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";
import { useGlobalState } from "../../../context/GlobalContext";
import L from "leaflet";
import styles from "./LayerManager.module.css";
import { FaLayerGroup } from "react-icons/fa6";

interface Layer {
  url: string;
  subdomains?: string;
}

interface LayerSet {
  id: string;
  layerSetName: string;
  layers: Layer[];
}

const LayerManager: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [layerSets, setLayerSets] = useState<LayerSet[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const map = useMap();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLayerSets = async () => {
      try {
        const response = await fetch("/assets/layerSets.json");
        const data: LayerSet[] = await response.json();
        setLayerSets(data);

        if (!state.layerSetId && data.length > 0) {
          dispatch({
            type: "SET_LAYER_SET",
            payload: { layerSetId: data[0].id },
          });
        }
      } catch (error) {
        console.error("Failed to load layer sets", error);
      }
    };
    fetchLayerSets();
  }, [dispatch, state.layerSetId]);

  useEffect(() => {
    const selectedLayerSet = layerSets.find(
      (set) => set.id === state.layerSetId
    );
    if (selectedLayerSet) {
      // Clear existing TileLayers
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      // Add layers from the selected layer set
      selectedLayerSet.layers.forEach((layer) => {
        // If no subdomains are provided, remove {s} from the URL
        const processedUrl = layer.subdomains
          ? layer.url
          : layer.url.replace("{s}.", "");

        const tileLayer = new L.TileLayer(processedUrl, {
          subdomains: layer.subdomains || [], // Use empty array if subdomains are undefined
          maxZoom: 20,
          maxNativeZoom: 18,
        });
        tileLayer.addTo(map);
      });
    }
  }, [state.layerSetId, layerSets, map]);

  const handleLayerSetChange = (layerSetId: string) => {
    dispatch({ type: "SET_LAYER_SET", payload: { layerSetId } });
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleOutsideClick = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <div className={styles.layerControl} ref={menuRef}>
      <button className={styles.toggleButton} onClick={toggleMenu}>
        <FaLayerGroup />
      </button>
      {menuOpen && (
        <div className={styles.menu}>
          {layerSets.map((set) => (
            <div
              key={set.id}
              className={`${styles.menuItem} ${
                set.id === state.layerSetId ? styles.selected : ""
              }`}
              onClick={() => handleLayerSetChange(set.id)}
            >
              {set.layerSetName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerManager;
