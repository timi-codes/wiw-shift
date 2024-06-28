const { expect } = require('chai').default;
const { splitShiftsIntoWeeks, getShiftSummary } = require('./index.js');

describe('Shift', () => {
    const shiftsData = [
        {
            EmployeeID: 1,
            StartTime: '2024-06-01T08:00:00Z',
            EndTime: '2024-06-01T17:00:00Z'
        },
        {
            EmployeeID: 2,
            StartTime: '2024-06-03T09:00:00Z',
            EndTime: '2024-06-03T18:00:00Z'
        },
        {
            EmployeeID: 1,
            StartTime: '2024-06-07T07:00:00Z',
            EndTime: '2024-06-07T16:00:00Z'
        }
    ];

    describe('splitShiftsIntoWeeks', () => {
        it('should split shifts into weeks correctly', () => {
            const result = splitShiftsIntoWeeks(shiftsData);

            expect(result['2024-05-26']).to.be.an('array').with.lengthOf(1);
            expect(result['2024-06-02']).to.be.an('array').with.lengthOf(1);
            expect(result['2024-06-09']).to.be.an('array').with.lengthOf(1);
        });
    });

    describe('getShiftSummary', () => {
        it('should calculate shift summary correctly', () => {
            const result = getShiftSummary(shiftsData);


            expect(result).to.be.an('array').with.lengthOf(2);

            const firstEmployeeSummary = result.find(summary => summary.EmployeeID === 1);
            expect(firstEmployeeSummary.RegularHours).to.equal(18); 
            expect(firstEmployeeSummary.OvertimeHours).to.equal(0);

            const secondEmployeeSummary = result.find(summary => summary.EmployeeID === 2);
            expect(secondEmployeeSummary.RegularHours).to.equal(9);
            expect(secondEmployeeSummary.OvertimeHours).to.equal(0);
        });
    });
});