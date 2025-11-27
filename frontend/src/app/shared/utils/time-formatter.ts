export function formatTime(hour: number | string): string {
    const h = typeof hour === 'string' ? parseInt(hour) : hour;
    return `${h.toString().padStart(2, '0')}:00`;
}

export function formatTimeRange(openTime: number | string, closeTime: number | string): string {
    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
}