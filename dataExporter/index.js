const xl = require('excel4node');
const Schema = require('../dataImporter/schema');
const utils = require('../utils/utils');
const PrepaidCard = require('../models/PrepaidCard');
const LoyaltyCard = require('../models/LoyaltyCard');

module.exports = class DataExporter{

    static async export(dataName){
        switch (dataName) {
            case 'prepaids':
                return await exportPOLCards('prepaids');
            case 'loyalties':
                return await exportPOLCards('loyalties');
            default:
                return null;
        }
    }

}

async function exportPOLCards(type){
    let cards;
    if(type == 'prepaids'){
        cards = await PrepaidCard.query();
    }else if(type == 'loyalties'){
        cards = await LoyaltyCard.query();
    }
    if(cards){
        return await genPOLCardsExcelFile(cards, type);
    }else{
        throw new Error('Unknow POLCard type');
    }
}

function genPOLCardsExcelFile(cards, type){
    return new Promise((resolve, reject) => {
        const name = (type == 'prepaids' ? 'Prepaid' : 'Loyalty') + ' Cards';
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet(name);
        const priceStyle = wb.createStyle({
            alignment: {
                horizontal: 'right',
            },
            numberFormat: '$#,##0.00; - $#,##.00; $0.00',
        });
    
        ws.column(1).setWidth(32);
        ws.cell(1, 1).string(Schema.barcode);
        ws.cell(1, 2).string(Schema.balance);
    
        const l = cards.length;
        let y = 2;
        for(let i = l - 1; i >= 0; i--){
            const card = cards[i];
            ws.cell(y, 1).string(card.barcode);
            ws.cell(y, 2).number(card.balance / 100).style(priceStyle);
            y++;
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