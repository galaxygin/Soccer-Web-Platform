import { format } from "date-fns";

export function getMondayOfTheWeek(): Date {
    const d = new Date();
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

export function getSundayOfTheWeek(): Date {
    const d = new Date();
    var day = d.getDay(),
        diff = d.getDate() + day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

export function getNextMonday(): Date {
    const d = new Date();
    var day = d.getDay(),
        diff = d.getDate() + day + 7 + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

export function formatDateToString(date: Date): string {
    return format(date, "yyyy-MM-dd")
}

export function formatTimeToString(date: Date): string {
    return (format(date, "HH:mm"))
}

export function removeSecondsFromTime(time: Date): string {
    return time.toString().replace(":00", "")
}