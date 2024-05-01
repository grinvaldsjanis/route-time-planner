export default function getColorForValue(
  value: number,
  minValue: number,
  maxValue: number,
  inverted: boolean = false
) {
  const ratio = (value - minValue) / (maxValue - minValue);
  // Determine the hue based on whether the inverted flag is true or not
  const hue = inverted ? (ratio * 190 - 0) : (200 - ratio * 190);

  return `hsl(${hue}, 100%, 50%)`;
}
