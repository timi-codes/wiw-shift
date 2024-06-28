import shiftsJson from './shifts.json';


interface Shift {
    ShiftID: number
    EmployeeID: number
    StartTime: string
    EndTime: string
}

// TODO
// 1. Split a continous shift into weeks 
// 2. Group shifts by employee id thats falls between start and end of week (to get shifts for a particular week)
// 3. Filter invalid shifts
// 4. For each group/week calculate the regular and overtime hours
// 4 Bonus: handle day light savings

const DAYS_IN_WEEK = 7;

function getStartOfWeek(_date: Date) {
    const date = new Date(_date);
    const dateOfMonth = date.getDate()
    const dayOfWeek = date.getDay()

    const diff = (dayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK;

    const startOfWeek = date;
    startOfWeek.setDate(dateOfMonth - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

function getEndOfWeek(_date: Date) {
    const date = new Date(_date);
    const dateOfMonth = date.getDate()
    const dayOfWeek = date.getDay()

    const diff = 6 - dayOfWeek

    const startOfWeek = date;
    startOfWeek.setDate(dateOfMonth + diff);
    startOfWeek.setHours(23, 59, 59, 999);
    return startOfWeek;
}

function splitShiftsIntoWeeks(data: Shift[]) {
    const groupShiftsByWeek: { [week: string]: Shift[] } = {};

    data.forEach((shift) => {
        let startTime = new Date(shift.StartTime);
        let endTime = new Date(shift.EndTime);

        const startOfWeek = getStartOfWeek(startTime)
        const endOfWeek = getEndOfWeek(endTime);

        const key = startOfWeek.toISOString().split('T')[0];

        if (!groupShiftsByWeek[key]) {
            groupShiftsByWeek[key] = [];
        }

        if (endTime > endOfWeek) {
            const firstPart = {
                ...shift,
                "EndTime": endOfWeek.toDateString()
            }
            groupShiftsByWeek[key].push(firstPart)


            const startOfSecondPartShift = getStartOfWeek(endTime);
            const secondPartKey = startOfSecondPartShift.toISOString().split('T')[0];
            const secondPart = {
                ...shift,
                StartTime: startOfSecondPartShift.toDateString()
            }
            groupShiftsByWeek[secondPartKey].push(secondPart)
            
        } else {
            groupShiftsByWeek[key].push(shift)
        }
    });
    return groupShiftsByWeek
}

function getShiftSummary() {
    const data: Shift[] = shiftsJson
    const shifts = splitShiftsIntoWeeks(data);
    console.log(shifts)
}


getShiftSummary()