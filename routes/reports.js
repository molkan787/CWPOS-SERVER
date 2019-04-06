const errors = require('restify-errors');
const reports = require('../reports/index');
const security = require('../security');
const resMaker = require('../utils/response');

module.exports = async (req, res, next) => {
    try {
        const filename = await generateReport(req.body);
        const signature = security.signContent(filename);
        res.send(resMaker.success({
            filename,
            signature,
            params: req.body,
        }));
        next();
    } catch (error) {
        console.log(error)
        return next(new errors.InternalError('ERROR:016'));
    }
};

async function generateReport(params){
    const type = params.type;
    let filename = null;
    switch (type) {
        case 'daily-sales':
            filename = await reports.genDailySales(params.day);
            break;
        case 'daily-summary':
            filename = await reports.genDailySummary(params.day);
            break;
        case 'weekly-summary':
            filename = await reports.genWeeklySummary(params.date_from, params.date_to);
            break;
        default:
            break;
    }

    if(filename){
        return filename;
    }else{
        throw new Error('Unknow Reports type.');
    }
}