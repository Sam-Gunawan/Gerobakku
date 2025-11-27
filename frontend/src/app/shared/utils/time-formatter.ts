export function formatTime(minutesSinceMidnight: number | string): string {
    const minutes = typeof minutesSinceMidnight === 'string' ? parseInt(minutesSinceMidnight) : minutesSinceMidnight;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTimeRange(openTime: number | string, closeTime: number | string): string {
    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
}