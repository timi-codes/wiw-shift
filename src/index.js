import shiftsData from './shifts.json' assert { type: 'json' };

// TODO
// 1. Split a continous shift into weeks 
// 2. Group shifts by employee id thats falls between start and end of week (to get shifts for a particular week)
// 3. Filter invalid shifts
// 4. For each group/week calculate the regular and overtime hours
// 4 Bonus: handle day light savings

const DAYS_IN_WEEK = 7;
const MAX_HOURS_PER_WEEK = 40;

function getStartOfWeek(_date) {
    const date = new Date(_date);
    const dateOfMonth = date.getUTCDate()
    const dayOfWeek = date.getUTCDay()

    const diff = (dayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK
 
    const startOfWeek = new Date(date);
    startOfWeek.setUTCDate(dateOfMonth - diff);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    return startOfWeek;
}

function getEndOfWeek(_date) {
    const date = new Date(_date);
    const dateOfMonth = date.getUTCDate()
    const dayOfWeek = date.getUTCDay()

    const diff = 6 - dayOfWeek

    const endOfWeek = new Date(date);
    endOfWeek.setUTCDate(dateOfMonth + diff);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    return endOfWeek;
}

export function splitShiftsIntoWeeks(data) {
    const shifts = []

    data.forEach((shift) => {
        let startTime = new Date(shift.StartTime);
        let endTime = new Date(shift.EndTime)

        if (startTime > endTime) {
            throw new Error(`Invalid shift: ${shift.ShiftID} - Start time is greater than end time`)
        }

        let endOfWeek = getEndOfWeek(startTime);

        shifts.push({
            ...shift,
            StartTime: startTime.toISOString(),
            EndTime: (endTime > endOfWeek ? endOfWeek : endTime).toISOString()
        });
        
        if (endTime > endOfWeek) {

            startTime = getStartOfWeek(endTime);

            shifts.push({
                ...shift,
                StartTime: startTime.toISOString(),
                EndTime: endTime.toISOString()
            });
         }

    });
    return shifts
}

export function getShiftSummary(data = shiftsData) {
    const shifts = splitShiftsIntoWeeks(data);
    const sortedShifts = shifts.sort((a, b) => new Date(a.StartTime) - new Date(b.StartTime));


    const summary = sortedShifts.reduce((acc, shift, currentIndex, shifts) => { 
        const week = getStartOfWeek(shift.EndTime).toISOString().split('T')[0];
        const key = `${shift.EmployeeID}-${week}`;

        if (!acc[key]) {
            acc[key] = []
        }

        const start = new Date(shift.StartTime);
        const end = new Date(shift.EndTime);
        const hours = (end - start) / 1000 / 60 / 60;

        const nextShift = shifts[currentIndex + 1];
        const isInvalid = nextShift &&
            end > new Date(nextShift.StartTime) &&
            start < new Date(nextShift.EndTime) &&
            (shift.EmployeeID === nextShift.EmployeeID);
        console.log(isInvalid, shift.ShiftID, nextShift?.ShiftID)

        const totalHours = isInvalid ? (acc[key].RegularHours ?? 0) : (acc[key].RegularHours ?? 0) + hours;
        const regularHours = Math.min(totalHours, MAX_HOURS_PER_WEEK);
        const overtimeHours = totalHours > MAX_HOURS_PER_WEEK ? totalHours - MAX_HOURS_PER_WEEK : 0;
        const invalidShifts = (acc[key].InvalidShifts ?? [])

        if (isInvalid) {
            invalidShifts.includes(shift.ShiftID) || invalidShifts.push(shift.ShiftID)
            invalidShifts.includes(nextShift.ShiftID) || invalidShifts.push(nextShift.ShiftID)
        } 

        acc[key] = {
            EmployeeID: shift.EmployeeID,
            StartOfWeek: week,
            RegularHours: regularHours,
            OvertimeHours: overtimeHours,
            InvalidShifts: invalidShifts
        }

        return acc;
    }, {});

    return Object.values(summary).flat();
}

console.log(getShiftSummary());