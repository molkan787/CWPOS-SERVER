const xl = require('excel4node');
const utils = require('../utils/utils');

let headStyle;
let priceStyle;

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
            }
        });
        priceStyle = wb.createStyle({
            alignment: {
                horizontal: 'right',
            }
        });
    }

    static daily(data){
        return new Promise((resolve, reject) => {
            const wb = new xl.Workbook();
            this.initStyle(wb);
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

            const prepaids = data.prepaids;
            const col = c_col++;
            const col2 = c_col++;
            for(let i = 0; i < prepaids.length; i++){
                const card = prepaids[i];
                ws.cell(c_row + i, col).string(card.barcode);
                ws.cell(c_row + i, col2).string(utils.price_m(card.balance));
            }

            const loyalties = data.loyalties;
            const col3 = c_col++;
            for(let i = 0; i < loyalties.length; i++){
                const card = loyalties[i];
                ws.cell(c_row + i, col3).string(card.barcode);
            }

            _price(data.washesAmount);
            _price(data.discount);
            _price(data.extra);

            const newPrepaids = data.newPrepaids;
            const col4 = c_col++;
            for(let i = 0; i < newPrepaids.length; i++){
                ws.cell(c_row + i, col4).string(newPrepaids[i]);
            }
            _price(data.newPrepaidsTotal);
            _price(data.detailingTotal);

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
        'CASH', 'CREDIT', 'INVOICE / ARI', 'VALUE OF FREE WASHES', 'PREPAID #', 'AMOUNT LEFT',
        'LOYALTY #', 'ALL CAR WASHES', 'DISCOUNT', 'EXTRAS', 'PP CARD NUMBER', 'TOTAL VALUE OF PREPAID CARDS',
        'TOTAL OF ALL VALUE OF DETAIL JOBS'
    ];
    const widths = [
        3, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 3, 2, 2, 2, 3, 3, 5,
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
    c_ws.cell(c_row, c_col++).string(utils.price(val)).style(priceStyle);
}
function _price_m(val){
    c_ws.cell(c_row, c_col++).string(utils.price_m(val)).style(priceStyle);
}
function _percent(val){
    const str_val = Math.round(val * 100) + '%';
    c_ws.cell(c_row, c_col++).string(str_val).style(priceStyle);
}