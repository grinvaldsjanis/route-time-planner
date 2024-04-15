
export function addTimes(startTime: string, duration: string): string {
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    const [dHours, dMinutes, dSeconds] = duration.split(':').map(Number);
    let endSeconds = seconds + dSeconds;
    let endMinutes = minutes + dMinutes + Math.floor(endSeconds / 60);
    let endHours = hours + dHours + Math.floor(endMinutes / 60);
    endSeconds %= 60;
    endMinutes %= 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')}`;
}

export function convertMinutesToHHMMSS(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60); // Convert minutes to seconds and round to nearest second
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


