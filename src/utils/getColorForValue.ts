export default function getColorForValue(
  value: number,
  minValue: number,
  maxValue: number,
  inverted: boolean = false
) {
  const ratio = (value - minValue) / (maxValue - minValue);
  const hue = inverted ? (ratio * 190 - 0) : (200 - ratio * 190);

  return `hsl(${hue}, 100%, 50%)`;
}
