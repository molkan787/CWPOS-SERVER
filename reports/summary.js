const xl = require('excel4node');
const utils = require('../utils/utils');

let headStyle;
let headStyle2;
let priceStyle;
let percentStyle;
let centerAlignStyle;
let borderStyle;

module.exports = class Summary{
    static initStyle(wb){
        headStyle = wb.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'darkUp',
                fgColor: '000000',
                bgColor: '000000',
            },
            font: {
                color: 'ffffff',
                bold: true,
            },
            alignment: {
                horizontal: 'center',
                shrinkToFit: true, 
                wrapText: true
            },
        });
        headStyle2 = wb.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'darkUp',
                fgColor: '000000',
                bgColor: '000000',
            },
            font: {
                color: 'ffffff',
                bold: true,
            },
            alignment: {
                horizontal: 'left',
                shrinkToFit: true, 
                wrapText: true
            },
        });
        centerAlignStyle = wb.createStyle({
            alignment: {
                horizontal: 'center',
            },
            font: {
                bold: true,
            },
        });
        priceStyle = wb.createStyle({
            alignment: {
                horizontal: 'right',
            },
            numberFormat: '$#,##0.00; - $#,##.00; -- ',
        });
        percentStyle = wb.createStyle({
            alignment: {
                horizontal: 'right',
            },
            numberFormat: '#%; -#%; -'
        });
        borderStyle = wb.createStyle({
            border: {
                left: {
                    style: 'thin',
                    color: '#000000'
                },
                right: {
                    style: 'thin',
                    color: '#000000'
                },
                top: {
                    style: 'thin',
                    color: '#000000'
                },
                bottom: {
                    style: 'thin',
                    color: '#000000'
                },
            },
        });
    }

    static daily(data){
        return new Promise((resolve, reject) => {
            const wb = new xl.Workbook();
            this.initStyle(wb);

            // Summary
            const ws = wb.addWorksheet('Reports');
            addDailySumHead(ws);
            setWS(ws);
            setRow(2);
            resetCol();
            
            
            _str(data.date);
            
            _num(data.cw);
            _num(data.pp);
            _num(data.rpp);
            _num(data.dt);

            _price(data.totals.cash);
            _price(data.totals.card);
            _price(data.totals.invoice_ari);
            _price(data.totals.other);
            _price(data.totals.prepaid);
            _price(data.totals.loyalty);

            _price(data.washesAmount);
            _price(data.discount);
            _price(data.extra);
            _price(data.tips);

            const newPrepaids = data.newPrepaids;
            const col4 = c_col++;
            for(let i = 0; i < newPrepaids.length; i++){
                ws.cell(c_row + i, col4).string(newPrepaids[i]);
            }
            _price(data.newPrepaidsTotal);
            _price(data.detailingTotal);

            // Reconcile
            const ws2 = wb.addWorksheet('Reconcile');
            initReconcileTemplate(ws2);
            setWS(ws2);
            ws2.cell(1, 2).string(data.date);
            ws2.cell(4, 2).number(data.totals.cash);
            ws2.cell(5, 2).number(data.totals.card);
            ws2.cell(6, 2).number(data.totals.prepaid);
            ws2.cell(7, 2).number(data.totals.loyalty);
            ws2.cell(8, 2).number(data.totals.invoice_ari);
            ws2.cell(9, 2).number(data.totals.other);

            ws2.cell(13, 2).number(data.sales.washes);
            ws2.cell(14, 2).number(data.sales.prepaid);
            ws2.cell(15, 2).number(data.sales.detailing);
            ws2.cell(16, 2).number(data.sales.extras);
            ws2.cell(17, 2).number(data.sales.others);
            ws2.cell(18, 2).number(data.sales.certificate);
            ws2.cell(19, 2).number(data.sales.discount);

            const filename = utils.rndSlug('.xlsx');
            wb.write('files/' + filename, err => {
                if(err){
                    reject(err);
                }else{
                    console.log(`File "${filename}" was written!`);
                    resolve(filename);
                }
            });
        });
    }
    
    static weekly(days){
        return new Promise((resolve, reject) => {
            const wb = new xl.Workbook();
            this.initStyle(wb);
            const ws = wb.addWorksheet('Reports');
            addWeeklySumHead(ws);
            setWS(ws);

            for(let i = 0; i < days.length; i++){
                setRow(i + 2);
                resetCol();
                const day = days[i];
                _str(day.date);
                _num(day.cw);
                _num(day.pp);
                _num(day.rpp);
                _num(day.dt);

                _price_m(day.cash);
                _price_m(day.credit);
                _price_m(day.cash_plus_credit);
                (i + 1 == days.length) ? _str('') : _percent(day.cash_vs_credit);
                _price_m(day.freeWashesValue);
                _price_m(day.invoice_ari);
                _price_m(day.prepaid);
                _price(day.allWashesValue);
                _price(day.discount);
                _price(day.extra);
                _price(day.tips);
                _price(day.newPrepaid);
                _price(day.detailingTotal);
            }

            const filename = utils.rndSlug('.xlsx');
            wb.write('files/' + filename, err => {
                if(err){
                    reject(err);
                }else{
                    console.log(`File "${filename}" was written!`);
                    resolve(filename);
                }
            });
        });
    }
}

function addDailySumHead(ws){
    const cells = [
        'DATE', 'CW', 'PP', 'RPP', 'DT',
        'CASH', 'CREDIT', 'INVOICE / ARI', 'VALUE OF FREE WASHES', 'PREPAID',
        'LOYALTY', 'ALL CAR WASHES', 'DISCOUNT', 'EXTRAS', 'TIPS', 'PP CARD NUMBER', 'TOTAL VALUE OF PREPAID CARDS',
        'TOTAL OF ALL VALUE OF DETAIL JOBS'
    ];
    const widths = [
        3, 1, 1, 1, 1, 2, 2, 2, 3, 3, 2, 3, 2, 2, 2, 2, 3, 3, 5,
    ];

    for(let i = 0; i < cells.length; i++){
        const text = cells[i];
        ws.cell(1, i + 1).string(text).style(headStyle);
        ws.column(i + 1).setWidth(widths[i] * 6);
    }
    ws.row(1).setHeight(30);
}

function addWeeklySumHead(ws){
    const cells = [
        'DATE', 'CW', 'PP', 'RPP', 'DT',
        'CASH', 'CREDIT', 'CASH + CREDIT', '% CASH VS CREDIT', 'VALUE OF FREE WASHES', 'INVOICE / ARI', 'PP VALUE',
        'ALL CAR WASHES', 'DISCOUNT', 'EXTRA', 'TOTAL VALUE OF PREPAID CARDS', 'TOTAL OF ALL VALUE OF DETAIL JOBS',

    ];
    const widths = [
        3, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 4
    ];

    for(let i = 0; i < cells.length; i++){
        const text = cells[i];
        ws.cell(1, i + 1).string(text).style(headStyle);
        ws.column(i + 1).setWidth(widths[i] * 6);
    }
    ws.row(1).setHeight(30);
}

function initReconcileTemplate(ws){
    ws.column(1).setWidth(32);
    ws.column(2).setWidth(15);
    ws.column(3).setWidth(15);

    ws.cell(1, 1).string('Date');

    ws.cell(3, 1).string('Payments').style(headStyle2);
    ws.cell(3, 2).string('POS').style(centerAlignStyle);
    ws.cell(3, 3).string('LIVE').style(centerAlignStyle);

    ws.cell(4, 1).string('Cash');
    ws.cell(5, 1).string('Credit/Debit Card');
    ws.cell(6, 1).string('Prepaid Card');
    ws.cell(7, 1).string('Loyalty Card');
    ws.cell(8, 1).string('Invoice / Ari');
    ws.cell(9, 1).string('Free / Other payments');
    ws.cell(10, 1).string('Total Payments').style(headStyle2);

    ws.cell(4, 2).style(priceStyle);
    ws.cell(5, 2).style(priceStyle);

    ws.cell(4, 3).style(priceStyle);
    ws.cell(5, 3).style(priceStyle);

    ws.cell(4, 4).formula('B4-C4').style(priceStyle);
    ws.cell(5, 4).formula('B5-C5').style(priceStyle);

    ws.cell(4, 2).style(priceStyle);
    ws.cell(5, 2).style(priceStyle);
    ws.cell(6, 2).style(priceStyle);
    ws.cell(7, 2).style(priceStyle);
    ws.cell(8, 2).style(priceStyle);
    ws.cell(9, 2).style(priceStyle);
    ws.cell(10, 2).formula('SUM(B4:B9)').style(priceStyle);
    ws.cell(10, 4).formula('B10').style(priceStyle);

    ws.cell(12, 1).string('Sales').style(headStyle2);
    ws.cell(13, 1).string('All car washes');
    ws.cell(14, 1).string('Prepaid Cards sold');
    ws.cell(15, 1).string('Total of detailing');
    ws.cell(16, 1).string('Total of extras');
    ws.cell(17, 1).string('Total of other items');
    ws.cell(18, 1).string('Total gift certificates');
    ws.cell(19, 1).string('Total of discounts');

    ws.cell(13, 2).style(priceStyle);
    ws.cell(14, 2).style(priceStyle);
    ws.cell(15, 2).style(priceStyle);
    ws.cell(16, 2).style(priceStyle);
    ws.cell(17, 2).style(priceStyle);
    ws.cell(18, 2).style(priceStyle);
    ws.cell(19, 2).style(priceStyle);

    ws.cell(21, 1).string('TOTAL');
    ws.cell(21, 2).formula('SUM(B13:B19)').style(priceStyle);
    ws.cell(21, 4).formula('B21').style(priceStyle);

    ws.cell(24, 1).string('Variance on payments and sales').style(headStyle2);
    ws.cell(24, 4).formula('D21-D10').style(priceStyle);

    ws.cell(26, 2).string('POS').style(centerAlignStyle);
    ws.cell(26, 3).string('LIVE').style(centerAlignStyle);
    ws.cell(26, 4).string('VARIANCE').style(centerAlignStyle);

    ws.cell(27, 2).formula('B4').style(priceStyle);
    ws.cell(27, 3).formula('C4').style(priceStyle);
    ws.cell(28, 2).formula('B5').style(priceStyle);
    ws.cell(28, 3).formula('C5').style(priceStyle);

    ws.cell(29, 2).formula('B27+B28').style(priceStyle);
    ws.cell(29, 3).formula('C27+C28').style(priceStyle);
    ws.cell(29, 4).formula('B29-C29').style(priceStyle);

    ws.cell(3, 2, 10, 4).style(borderStyle);
    ws.cell(4, 1, 9, 1).style(borderStyle);
    ws.cell(13, 1, 21, 4).style(borderStyle);
    ws.cell(26, 2, 29, 4).style(borderStyle);
    ws.cell(24, 4).style(borderStyle);

}

// -----------------------------------
let c_ws;
let c_row = 1;
let c_col = 1;
function setWS(ws){
    c_ws = ws;
}
function setRow(row){
    c_row = row;
}
function resetCol(){
    c_col = 1;
}
function _num(val){
    c_ws.cell(c_row, c_col++).number(val);
}
function _str(val){
    c_ws.cell(c_row, c_col++).string(val);
}
function _price(val){
    c_ws.cell(c_row, c_col++).number(val).style(priceStyle);
}
function _price_m(val){
    c_ws.cell(c_row, c_col++).number(val / 100).style(priceStyle);
}
function _percent(val){
    c_ws.cell(c_row, c_col++).number(val).style(percentStyle);
}