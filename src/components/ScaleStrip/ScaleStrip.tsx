import React, {
  useEffect,
  useState,
  useRef,
  CSSProperties,
  useCallback,
} from "react";
import { useGlobalState } from "../../context/GlobalContext";
import { calculateValueRange } from "../../utils/calculateValueRange";
import getColorForValue from "../../utils/getColorForValue";
import { setHighlight, setValueRanges } from "../../context/actions";
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
  const { gpxData, mapMode, currentTrackIndex } = state;
  const stripRef = useRef<HTMLDivElement | null>(null);
  const isMouseInsideRef = useRef(false);

  const [range, setRange] = useState({ minValue: 0, maxValue: 100 });
  const [hasNoRange, setHasNoRange] = useState(false);
  const [localHighlightRange, setLocalHighlightRange] = useState<
    [number, number]
  >([0, 0]);

  useEffect(() => {
    if (!gpxData || currentTrackIndex === null || !mapMode) {
      setRange({ minValue: 0, maxValue: 100 });
      setHasNoRange(false);
      return;
    }

    const currentTrack = gpxData.tracks[currentTrackIndex];

    if (
      !currentTrack ||
      !currentTrack.points ||
      currentTrack.points.length === 0
    ) {
      setRange({ minValue: 0, maxValue: 100 });
      setHasNoRange(true);
      return;
    }

    // Determine the modeKey and default value for the current map mode
    let modeKey: "curve" | "slope" | "ele" | "speedLimit";
    let defaultValue: number;

    switch (mapMode) {
      case "curve":
        modeKey = "curve";
        defaultValue = 1000;
        break;
      case "slope":
        modeKey = "slope";
        defaultValue = 0;
        break;
      case "speedLimit":
        modeKey = "speedLimit";
        defaultValue = 0;
        break;
      default:
        modeKey = "ele";
        defaultValue = 0;
        break;
    }

    // Calculate value range based on the modeKey
    const { minValue, maxValue } = calculateValueRange(
      [currentTrack],
      modeKey,
      defaultValue
    );

    setHasNoRange(minValue === maxValue);
    setRange({
      minValue: isNaN(minValue) ? 0 : minValue,
      maxValue: isNaN(maxValue) ? 0 : maxValue,
    });

    setLocalHighlightRange([minValue, maxValue]);

    // Dispatch updated value ranges to the global state
    dispatch(setValueRanges(modeKey, minValue, maxValue));
  }, [mapMode, gpxData, currentTrackIndex, dispatch]);

  const debouncedUpdateHighlight = useRef(
    debounce((value: number, tolerance: number) => {
      if (isMouseInsideRef.current) {
        const highlightRange: [number, number] = [
          value - tolerance,
          value + tolerance,
        ];
        dispatch(setHighlight(highlightRange, true));
      }
    }, 100)
  ).current;

  const updateHighlight = (value: number) => {
    if (isMouseInsideRef.current) {
      const tolerance = (range.maxValue - range.minValue) * 0.1;
      debouncedUpdateHighlight(value, tolerance);
    }
  };

  const handleMouseEnter = () => {
    isMouseInsideRef.current = true;
  };

  const handleMouseLeave = () => {
    isMouseInsideRef.current = false;
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
      clipPath: `polygon(${left}% 0%, ${100 - right}% 0%, ${
        100 - right
      }% 100%, ${left}% 100%)`,
    };
  };

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
          <div
            className="gradient-strip background"
            style={gradientStyle}
          ></div>
          <div
            className="gradient-strip foreground"
            style={{ ...gradientStyle, ...getForegroundStyle() }}
          ></div>
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
