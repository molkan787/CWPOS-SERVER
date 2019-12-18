const xl = require('excel4node');
const utils = require('../utils/utils');
const time = require('../utils/time');

let headStyle;
let priceStyle;
let priceStyleWithPositiveSign;
let percentStyle;

module.exports = class Sales{
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
            },
            numberFormat: '$#,##0.00; - $#,##.00; -- ',
        });
        priceStyleWithPositiveSign = wb.createStyle({
            alignment: {
                horizontal: 'right',
            },
            numberFormat: '+ $#,##0.00; - $#,##.00; -- ',
        });
        percentStyle = wb.createStyle({
            alignment: {
                horizontal: 'right',
            },
            numberFormat: '#%; -#%; -',
        });
    }

    static daily(orders, _wb){
        return new Promise((resolve, reject) => {
            const wb = _wb || new xl.Workbook();
            this.initStyle(wb);
            const ws = wb.addWorksheet('Sales');
            addDailyHead(ws);
            setWS(ws);
            setRow(2);
            resetCol();

            for(let i = 0; i < orders.length; i++){
                ws.row(i + 2).setHeight(30);
                setRow(i + 2);
                resetCol();
                const o = orders[i];
                _str(o.id + '');
                _str(o.date);
                _num(o.cw);
                _num(o.pp);
                _num(o.rpp);
                _num(o.dt);
                _str(o.ticket);
                _str(o.cashier);
                _price_m(o.total);
                _str(o.payment);
                _strArr(o.washes);
                _strArr(o.extras);
                _price(o.discount);
                _str(o.discount_r);
                _strArr(o.newPrepaids);
                _strArr(o.reloadPrepaids);
                _strArr(o.detailing);
                _strArr(o.otheritems);
                _strArr(o.certificates);
            }

            if(_wb){
                return;
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

    static loyaltyPoints(actions){
        return new Promise((resolve, reject) => {
            const wb = new xl.Workbook();
            this.initStyle(wb);
            const ws = wb.addWorksheet('Loyalty point (Manually)');
            addLoyaltyPointsHead(ws);

            let y = 2;
            for(let ax of actions){
                if (!ax.loyalty) continue;
                ws.cell(y, 1).string(time.timestampToDate(ax.date_added, true));
                ws.cell(y, 2).string(ax.loyalty.barcode);
                ws.cell(y, 3).number(ax.s1 / 100).style(priceStyle);
                ws.cell(y, 4).string(ax.data.user.username);
                y++;
            }

            const filename = utils.rndSlug('.xlsx');
            wb.write('files/' + filename, err => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`File "${filename}" was written!`);
                    resolve(filename);
                }
            });

        });
    }

    static cardsBalanceAdjustment(actions, card_type){
        return new Promise((resolve, reject) => {
            if (card_type != 'prepaid' && card_type != 'loyalty'){
                reject(new Error('Invalid card type'));
                return;
            }
            const cardName = card_type == 'prepaid' ? 'Prepaid' : 'Loyalty';
            const wb = new xl.Workbook();
            this.initStyle(wb);
            const ws = wb.addWorksheet(`${cardName} balances adjustment`);
            addBalancesAdjHead(ws);

            let y = 2;
            for (let i = actions.length - 1; i >= 0; i--) {
                let ax = actions[i];
                if (!ax.loyalty && !ax.prepaid) continue;
                ws.cell(y, 1).string(time.timestampToDate(ax.date_added, true));
                ws.cell(y, 2).string(ax[card_type].barcode);
                ws.cell(y, 3).number(ax.s2 / 100).style(priceStyle);
                ws.cell(y, 4).number(ax.s1 / 100).style(priceStyle);
                ws.cell(y, 5).number((ax.s1 - ax.s2) / 100).style(priceStyleWithPositiveSign);
                if(ax.user)
                    ws.cell(y, 6).string(ax.user.username);
                else
                    ws.cell(y, 6).string('---');
                y++;
            }

            const filename = utils.rndSlug('.xlsx');
            wb.write('files/' + filename, err => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`File "${filename}" was written!`);
                    resolve(filename);
                }
            });

        });
    }

}

function addDailyHead(ws){
    const cells = [
        'ID', 'DATE & TIME', 'CW', 'PP', 'RPP', 'DT',
        'TICKET #', 'CASHIER ID', 'ORDER VALUE', 'PAYMENT TYPE', 'WASHES', 'EXTRAS', 'DISCOUNT', 'DISCOUNT REASON',
        'NEW PREPAID CARD', 'RELOAD OF PREPAID CARD', 'DETAILING WORK', 'OTHER ITEMS', 'GIFT CERTIFICATES',
    ];
    const widths = [
        1, 3, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 2, 3, 4, 4, 4, 4, 4,
    ];

    for(let i = 0; i < cells.length; i++){
        const text = cells[i];
        ws.cell(1, i + 1).string(text).style(headStyle);
        ws.column(i + 1).setWidth(widths[i] * 6);
    }
    ws.row(1).setHeight(30);
}

function addLoyaltyPointsHead(ws){
    const cells = [
        'DATE & TIME', 'Card No.', 'Amount', 'Cashier'
    ];
    const widths = [
        3, 5, 2, 3,
    ];

    for (let i = 0; i < cells.length; i++) {
        const text = cells[i];
        ws.cell(1, i + 1).string(text).style(headStyle);
        ws.column(i + 1).setWidth(widths[i] * 6);
    }
}

function addBalancesAdjHead(ws) {
    const cells = [
        'DATE & TIME', 'Card No.', 'Changed from', 'Changed to', 'Change amount', 'User'
    ];
    const widths = [
        3, 5, 3, 3, 3, 2
    ];

    for (let i = 0; i < cells.length; i++) {
        const text = cells[i];
        ws.cell(1, i + 1).string(text).style(headStyle);
        ws.column(i + 1).setWidth(widths[i] * 6);
    }
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
function _strArr(val){
    let str = '';
    for(let i = 0; i < val.length; i++){
        if(str) str += "\n";
        str += '- ' + val[i];
    }
    c_ws.cell(c_row, c_col++).string(str);
}