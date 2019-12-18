const Reports = require('./reports');

module.exports = class TESTING{

    static do(){
        this.createDailySummary();
    }

    static createDailySummary(){
        Reports.genDailyReports(1576623600)
    }

}