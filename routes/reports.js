const fs = require('fs');
const errors = require('restify-errors');
const reports = require('../reports/index');

module.exports = async (req, res, next) => {
    try {
        const params = {day: parseInt(req.params.day), type: 'daily-sales'}
        await generateReport(params, res); // $TMP
        next();
    } catch (error) {
        console.log(error)
        return next(new errors.InternalError('ERROR:016'));
    }
};

async function generateReport(params, res){
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
        const readStream = fs.createReadStream(`${appRoot}/files/${filename}`);
        res.writeHead(200, {
            "Content-Type": 'application/octet-stream',
            "Content-Disposition": "attachment; filename=" + filename,
        });
        readStream.pipe(res);
    }else{
        throw new Error('Unknow error during report generation.');
    }
}