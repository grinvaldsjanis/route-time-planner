export default function formatTimeToHHMM(timeStr?: string): string {
  if (!timeStr) return "00:00"; // Return a default value if timeStr is undefined or empty
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(":");
  }
  return timeStr;
}
