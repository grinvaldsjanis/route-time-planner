import { TrackPoint } from "./types";
import travelModes from "../constants/travelModes";

const GRAVITY = 9.81; // m/s^2

const calculateSpeed = (
  point: TrackPoint,
  modeKey: keyof typeof travelModes
): number => {
  const mode = travelModes[modeKey];

  if (!mode) {
    console.error("Invalid travel mode key:", modeKey);
    return 0;
  }

  const { maxSpeed, powerFactor, handlingFactor, maxSpeedRadius, weight } = mode;

  // Curve adjustment
  const curve = point.curve ?? 1000; // Default to a large radius
  const curveAdjustment = Math.max(
    0.2, // Minimum adjustment
    1 / (1 + Math.pow(maxSpeedRadius / curve, handlingFactor))
  );

  // Slope adjustment
  const slope = point.slope ?? 0;
  let slopeAdjustmentFactor = 1;

  if (slope > 0) {
    const slopeResistance = weight * GRAVITY * (slope / 100); // Resistance due to slope
    const powerInWatts = powerFactor * 1000; // kW to Watts
    const uphillSpeed = Math.min(
      powerInWatts / slopeResistance,
      maxSpeed / 3.6
    );
    slopeAdjustmentFactor = Math.min(uphillSpeed / (maxSpeed / 3.6), 3); // Normalize and cap at 3x
  } else if (slope < 0) {
    const downhillBoost = GRAVITY * Math.abs(slope / 100) * 0.5; // Reduce gravity boost
    const downhillSpeed = maxSpeed / 3.6 + downhillBoost; // m/s
    slopeAdjustmentFactor = Math.min(downhillSpeed / (maxSpeed / 3.6), 1.5); // Cap at 1.5x
  }

  // Combine adjustments
  const effectiveSpeed =
    maxSpeed *
    curveAdjustment *
    Math.max(0.5, Math.min(slopeAdjustmentFactor, 1)); // Ensure reasonable speed

  // Enforce a lower bound for very slow speeds
  const resultingSpeed = Math.max(
    maxSpeed * 0.2,
    Math.min(effectiveSpeed, maxSpeed)
  );

  console.log("Resulting Speed:", resultingSpeed, {
    curveAdjustment,
    slopeAdjustmentFactor,
    curve,
    maxSpeedRadius,
    slope,
    maxSpeed,
    modeKey,
  });

  return resultingSpeed;
};

export default calculateSpeed;
