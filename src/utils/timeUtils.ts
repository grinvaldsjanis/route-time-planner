export function minutesToSeconds(minutes: number) {
  return Math.round(minutes * 60);
}

export function formatDayTime(time: string, days: number): string {
  const dayStr = days > 0 ? `+${days} day(s)` : "";
  return `${time} ${dayStr}`;
}

export function addSeconds(startTimeSeconds: number, durationSeconds: number) {
  return startTimeSeconds + durationSeconds;
}

export function formatTimeFromSeconds(seconds: number) {
  const days = Math.floor(seconds / 86400);
  let remainder = seconds % 86400;
  const hours = Math.floor(remainder / 3600).toString().padStart(2, '0');
  remainder = remainder % 3600;
  const minutes = Math.floor(remainder / 60).toString().padStart(2, '0');
  const secs = (remainder % 60).toString().padStart(2, '0');
  return `${days > 0 ? `+${days}d ` : ''}${hours}:${minutes}:${secs}`;
}



export function convertMinutesToHHMMSS(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
