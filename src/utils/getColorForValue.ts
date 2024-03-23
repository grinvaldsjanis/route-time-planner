export default function getColorForValue(
  value: number,
  minValue: number,
  maxValue: number
) {
  const ratio = (value - minValue) / (maxValue - minValue);
  return `hsl(${180 - ratio * 160}, 100%, 50%)`;
}
