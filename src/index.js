const shiftsJson = require('./shifts.json')
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
    const dateOfMonth = date.getDate()
    const dayOfWeek = date.getDay()

    const diff = (dayOfWeek + DAYS_IN_WEEK) % DAYS_IN_WEEK;

    const startOfWeek = date;
    startOfWeek.setDate(dateOfMonth - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

function getEndOfWeek(_date) {
    const date = new Date(_date);
    const dateOfMonth = date.getDate()
    const dayOfWeek = date.getDay()

    const diff = 6 - dayOfWeek

    const startOfWeek = date;
    startOfWeek.setDate(dateOfMonth + diff);
    startOfWeek.setHours(23, 59, 59, 999);
    return startOfWeek;
}

function splitShiftsIntoWeeks(data) {
    const groupShiftsByWeek = {};

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

function getEmployeeShiftsForWeek(shifts, week) {
    return shifts.reduce((acc, shift) => {
        const start = new Date(shift.StartTime);
        const end = new Date(shift.EndTime);
        const hours = (end - start) / 1000 / 60 / 60;

        const totalHours = acc.RegularHours + hours;
        const regularHours = Math.min(totalHours, MAX_HOURS_PER_WEEK);
        const overtimeHours = totalHours > MAX_HOURS_PER_WEEK ? totalHours - MAX_HOURS_PER_WEEK : 0;

        if (!acc.EmployeeID) {
            acc.EmployeeID = shift.EmployeeID;
            acc.StartOfWeek = week;
            acc.RegularHours = regularHours;
            acc.OvertimeHours = overtimeHours;
        } else {
            acc.RegularHours += regularHours;
            acc.OvertimeHours += overtimeHours;
        }

        return acc;
    }, { RegularHours: 0, OvertimeHours: 0 });
}


function getShiftSummary(data = shiftsJson) {
    const shifts = splitShiftsIntoWeeks(data);
    
    const result = Object.keys(shifts).reduce((acc, week) => {
        const weekShifts = shifts[week];
        const employeeShifts = weekShifts.reduce((empAcc, shift) => {
            const empShift = getEmployeeShiftsForWeek([shift], week);
            if (empShift.EmployeeID) {
                empAcc.push(empShift);
            }
            return empAcc;
        }, []);

        acc.push(...employeeShifts);
        return acc;
    }, []);
    console.log(result);
    return result;
}

module.exports = {
    splitShiftsIntoWeeks,
    getShiftSummary
};

// getShiftSummary()