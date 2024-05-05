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

interface TimeCalculationResult {
  timeString: string;
  daysAdded: number;
}

export function addTimes(
  startTime: string,
  duration: string
): TimeCalculationResult {
  const [hours, minutes, seconds] = startTime.split(":").map(Number);
  const [dHours, dMinutes, dSeconds] = duration.split(":").map(Number);
  let endSeconds = seconds + dSeconds;
  let endMinutes = minutes + dMinutes + Math.floor(endSeconds / 60);
  let endHours = hours + dHours + Math.floor(endMinutes / 60);
  let daysAdded = Math.floor(endHours / 24);
  endHours %= 24;
  endSeconds %= 60;
  endMinutes %= 60;
  const timeString = `${endHours.toString().padStart(2, "0")}:${endMinutes
    .toString()
    .padStart(2, "0")}:${endSeconds.toString().padStart(2, "0")}`;
  return { timeString, daysAdded };
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
