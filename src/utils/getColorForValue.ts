export default function getColorForValue(
  value: number,
  minValue: number,
  maxValue: number
) {
  const ratio = (value - minValue) / (maxValue - minValue);
  return `hsl(${200 - ratio * 190}, 100%, 50%)`;
}
