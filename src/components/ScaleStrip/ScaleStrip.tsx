import React, { useEffect, useState, useCallback, useRef, CSSProperties } from "react";
import { useGlobalState } from "../../context/GlobalContext";
import { calculateValueRange } from "../../utils/calculateValueRange";
import getColorForValue from "../../utils/getColorForValue";
import { setHighlight } from "../../context/actions";
import "./ScaleStrip.css";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ScaleStrip: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const { gpxData, mapMode, highlightMode } = state;
  const tracks = gpxData?.tracks;
  const stripRef = useRef<HTMLDivElement | null>(null);

  const [range, setRange] = useState({ minValue: 0, maxValue: 100 });
  const [hasNoRange, setHasNoRange] = useState(false);
  const isMouseInsideRef = useRef(false);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const [localHighlightRange, setLocalHighlightRange] = useState<[number, number]>([
    0,
    0,
  ]);

  useEffect(() => {
    if (!tracks || !mapMode) {
      setRange({ minValue: 0, maxValue: 100 });
      setHasNoRange(false);
      return;
    }

    const modeKey =
      mapMode === "curve" ? "curve" : mapMode === "slope" ? "slope" : "ele";
    const defaultValue = modeKey === "curve" ? 1000 : 0;
    const { minValue, maxValue } = calculateValueRange(
      tracks,
      modeKey,
      defaultValue
    );

    setHasNoRange(minValue === maxValue);
    setRange({
      minValue: isNaN(minValue) ? 0 : minValue,
      maxValue: isNaN(maxValue) ? 0 : maxValue,
    });

    // Set initial highlight range to full range
    setLocalHighlightRange([minValue, maxValue]);
  }, [mapMode, tracks]);

  const generateLabels = () => {
    const steps = 9;
    const stepValue = (range.maxValue - range.minValue) / steps;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = range.minValue + stepValue * i;
      return {
        value: Math.round(value),
        color: getColorForValue(
          value,
          range.minValue,
          range.maxValue,
          mapMode === "curve"
        ),
      };
    });
  };

  const labels = generateLabels();
  const gradientStops = labels
    .map(
      (label) =>
        `${label.color} ${
          ((label.value - range.minValue) / (range.maxValue - range.minValue)) *
          100
        }%`
    )
    .join(", ");
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops})`,
  };

  const updateHighlight = useCallback(
    debounce((value: number) => {
      if (isMouseInsideRef.current) {
        const tolerance = (range.maxValue - range.minValue) * 0.1;
        const highlightRange: [number, number] = [
          value - tolerance,
          value + tolerance,
        ];
        dispatch(setHighlight(highlightRange, true));
      }
    }, 200),
    [range, dispatch]
  );

  const handleMouseEnter = () => {
    isMouseInsideRef.current = true;
    setIsMouseInside(true);
  };

  const handleMouseLeave = () => {
    isMouseInsideRef.current = false;
    setIsMouseInside(false);
    setLocalHighlightRange([range.minValue, range.maxValue]);
    dispatch(setHighlight([range.minValue, range.maxValue], false));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stripRef.current) return;

    const rect = stripRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const stripWidth = rect.width;
    const value =
      range.minValue +
      (offsetX / stripWidth) * (range.maxValue - range.minValue);

    const tolerance = (range.maxValue - range.minValue) * 0.1;
    const newHighlightRange: [number, number] = [
      value - tolerance,
      value + tolerance,
    ];

    setLocalHighlightRange(newHighlightRange);
    updateHighlight(value);
  };

  const getForegroundStyle = (): CSSProperties => {
    const left =
      ((localHighlightRange[0] - range.minValue) /
        (range.maxValue - range.minValue)) *
      100;
    const right =
      100 -
      ((localHighlightRange[1] - range.minValue) /
        (range.maxValue - range.minValue)) *
        100;

    return {
      clipPath: `polygon(${left}% 0%, ${100 - right}% 0%, ${100 - right}% 100%, ${left}% 100%)`,
    };
  };

  return (
    <div
      className="scale-strip"
      ref={stripRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hasNoRange ? (
        <div className="no-range">There's no range for the data</div>
      ) : (
        <>
          <div className="gradient-strip background" style={gradientStyle}></div>
          <div className="gradient-strip foreground" style={{ ...gradientStyle, ...getForegroundStyle() }}></div>
          <div className="scale-labels">
            {labels.map((label, index) => (
              <span key={index}>{label.value}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ScaleStrip;
