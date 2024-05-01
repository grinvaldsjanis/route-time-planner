export default function formatTimeToHHMM(timeStr: string): string {
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(":");
  }
  return timeStr;
}
