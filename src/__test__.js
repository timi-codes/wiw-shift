import { expect } from 'chai';
import { splitShiftsIntoWeeks, getShiftSummary } from './index.js';

const testData = [
    {
        ShiftID: 1,
        EmployeeID: 1,
        StartTime: '2024-06-01T08:00:00Z',
        EndTime: '2024-06-01T17:00:00Z'
    },
    {
        ShiftID: 2,
        EmployeeID: 2,
        StartTime: '2024-06-03T09:00:00Z',
        EndTime: '2024-06-03T18:00:00Z'
    },
    {
        ShiftID: 3,
        EmployeeID: 2,
        StartTime: '2024-06-03T12:00:00Z',
        EndTime: '2024-06-03T18:00:00Z'
    },
    {
        ShiftID: 4,
        EmployeeID: 2,
        StartTime: '2024-06-03T12:00:00Z',
        EndTime: '2024-06-03T20:00:00Z'
    },
    {
        ShiftID: 5,
        EmployeeID: 1,
        StartTime: '2024-06-11T07:00:00Z',
        EndTime: '2024-06-11T20:00:00Z'
    },
    {
        ShiftID: 6,
        EmployeeID: 1,
        StartTime: '2024-06-12T09:00:00Z',
        EndTime: '2024-06-12T17:00:00Z'
    },
    {
        ShiftID: 7,
        EmployeeID: 1,
        StartTime: '2024-06-13T10:00:00Z',
        EndTime: '2024-06-13T23:00:00Z'
    },
    {
        ShiftID: 8,
        EmployeeID: 1,
        StartTime: '2024-06-14T10:00:00Z',
        EndTime: '2024-06-14T17:00:00Z'
    },
    {
        ShiftID: 9,
        EmployeeID: 1,
        StartTime: '2024-06-15T17:00:00Z',
        EndTime: '2024-06-16T03:00:00Z' // This shift spans two weeks
    }
]

describe('Shift', () => {

    describe('splitShiftsIntoWeeks', () => {
        it('should split shifts spanning two weeks correctly', () => {
            const result = splitShiftsIntoWeeks(testData);

            expect(result).lengthOf(10);

            const shift3 = result.filter(shift => shift.ShiftID === 9);
            expect(shift3).lengthOf(2);
            expect(shift3[0].StartTime).to.equal('2024-06-15T17:00:00.000Z');
            expect(shift3[0].EndTime).to.equal('2024-06-15T23:59:59.999Z');
            expect(shift3[1].StartTime).to.equal('2024-06-16T00:00:00.000Z');
            expect(shift3[1].EndTime).to.equal('2024-06-16T03:00:00.000Z');
        });
    });

    describe('getShiftSummary', () => {
        it('should calculate shift summary correctly', () => {
            const result = getShiftSummary(testData);
            console.log(result)
            expect(result).lengthOf(4);
            expect(result[2]).to.deep.equal({
                EmployeeID: 1,
                StartOfWeek: '2024-06-09',
                RegularHours: 40,
                OvertimeHours: 6.9999997222222206,
                InvalidShifts: []
            });
        });
    });
});