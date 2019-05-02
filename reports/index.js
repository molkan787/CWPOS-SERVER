const summary = require('./summary');
const sales = require('./sales');
const Factory = require('./factory');
const time = require('../utils/time');
const wb = require('../utils/whereBuilder');
const Order = require('../models/Order');
const Stats = require('../models/Stats');
const utils = require('../utils/utils');

module.exports = class Reports {

    static async genDailySummary(day){
        try {
            const cond = wb.dateRange({date_from: day, date_to: day});
            const orders = await Order.query().eager('transaction.[prepaid, loyalty]').whereRaw(cond);
            const data = this.prepareDailySummaryData(orders);
            const stats = await Stats.getTodays();
            const date = time.timestampToDate(day);

            return await summary.daily({...stats, ...data, date});
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async genWeeklySummary(date_from, date_to){
        try {
            const cond = wb.dateRange({date_from, date_to});
            const cond2 = wb.dateRange({date_from, date_to}, 'day');
            const orders = await Order.query().whereRaw(cond);
            const stats = await Stats.query().whereRaw(cond2);

            const data = this.prepareWeeklySummaryData(orders, stats, date_from, date_to);
            return await summary.weekly(data);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async genDailySales(day){
        try {
            const cond = wb.dateRange({date_from: day, date_to: day});
            const orders = await Order.query().eager('[cashier, transaction.[prepaid, loyalty]]').whereRaw(cond);
            const data = this.prepareDailySalesData(orders);

            return await sales.daily(data);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static prepareDailySummaryData(orders){
        const totals = Factory.genPayMethodMap();
        const sales = {
            washes: 0,
            prepaid: 0,
            extras: 0,
            others: 0,
            detailing: 0,
            certificate: 0,
            discount: 0,
        };
        const data = {
            totals,
            prepaids: [],
            loyalties: [],
            washesAmount: 0,
            discount: 0,
            extra: 0,
            newPrepaids: [],
            newPrepaidsTotal: 0,
            detailingTotal: 0,
            sales,
        };

        for(let i = 0; i < orders.length; i++){
            const order = orders[i];
            const paym = order.pay_method;
            totals[paym] += order.total / 100;
            const prepaidCards = this.getPrepaidCards(order);
            const values = this.extractValues(order);
            data.washesAmount += values.washes;
            data.discount += order.totals.discount || 0;
            data.extra += order.totals.extraCharge || 0;
            data.newPrepaids.push(...prepaidCards.barcodes);
            data.newPrepaidsTotal += prepaidCards.total;
            data.detailingTotal += values.detailing;

            sales.washes += values.washes;
            sales.detailing += values.detailing;
            sales.extras += values.extras;
            sales.others += values.others;
            sales.prepaid += values.prepaid;
            sales.certificate += values.certificate;
            sales.discount += values.discount;
        }
        return data;        
    }

    static prepareWeeklySummaryData(orders, stats, date_from, date_to){
        const map = Factory.genDaysMap(date_from, date_to, wsr_template, {addSum: true, modifier: wsr_modifier});

        for(let i = 0; i < orders.length; i++){
            const order = orders[i];
            const dayTime = time.roundToDay(order.date_added);
            const day = map.days[dayTime];

            switch (order.pay_method) {
                case 'cash':
                    day.cash += order.total;
                    break;
                case 'card':
                    day.credit += order.total;
                    break;
                case 'invoice_ari':
                    day.invoice_ari += order.total;
                    break;
                case 'prepaid':
                    day.prepaid += order.total;
                    break;
                case 'other':
                    day.freeWashesValue += order.total;
                    break;
                default:
                    break;
            }

            const values = this.extractValues(order);
            day.allWashesValue += values.washes;
            day.detailingTotal += values.detailing;
            day.discount += order.totals.discount;
            day.extra += order.totals.extraCharge;
            day.newPrepaid += this.getPrepaidCards(order).total;
        }

        for(let i = 0; i < stats.length; i++){
            const stat = stats[i];
            const day = map.days[stat.day];
            if(!day) continue;
            day.cw = stat.cw;
            day.pp = stat.pp;
            day.rpp = stat.rpp;
            day.dt = stat.dt;
        }

        const sum = map.days['sum'];
        for(let i = 0; i < map.list.length - 1; i++){
            const day = map.list[i];
            day.cash_plus_credit = day.cash + day.credit;
            day.cash_vs_credit = (day.cash_plus_credit == 0) ? 0 : day.cash / day.cash_plus_credit;

            sum.cw += day.cw;
            sum.pp += day.pp;
            sum.rpp += day.rpp;
            sum.dt += day.dt;
            sum.cash += day.cash;
            sum.credit += day.credit;
            sum.cash_plus_credit += day.cash_plus_credit;
            sum.freeWashesValue += day.freeWashesValue;
            sum.invoice_ari += day.invoice_ari;
            sum.prepaid += day.prepaid;
            sum.allWashesValue += day.allWashesValue;
            sum.discount += day.discount;
            sum.extra += day.extra;
            sum.newPrepaid += day.newPrepaid;
            sum.detailingTotal += day.detailingTotal;
        }
        return map.list;
    }

    static prepareDailySalesData(orders){
        const result = [];
        for(let i = 0; i < orders.length; i++){
            const order = orders[i];
            const row = this.extractItems(order);
            row.id = order.id;
            row.date = time.timestampToDate(order.date_added, true);
            row.cw = row.washes.length;
            row.pp = row.newPrepaids.length;
            row.rpp = row.reloadPrepaids.length;
            row.dt = row.detailing.length;

            row.ticket = order.other_data.ticket;
            row.cashier = order.cashier.username;
            row.total = order.total;
            row.payment = this.getPaymentText(order);
            row.discount = order.totals.discount;
            row.discount_r = '  ---';

            result.push(row);
        }
        return result;
    }
    // .................Helpers.................

    static getPaymentText(order){
        const paym = order.pay_method;
        const tx = order.transaction;
        if(paym == 'prepaid' && tx){
            return 'PREPAID: ' + tx.prepaid.barcode;
        }else if(paym == 'loyalty' && tx){
            return 'LOYALTY: ' + tx.loyalty.barcode;
        }else{
            return Factory.getPaymText(order.pay_method);
        }
    }

    static getAssociatedCard(transaction){
        if(transaction){
            if(transaction.xtype == 'prepaid'){
                return transaction.prepaid;
            }else if(transaction.xtype == 'loyalty'){
                return transaction.loyalty;
            }
        }else{
            throw new Error('Transaction argument is Null or Undefined');
        }
    }

    static extractValues(order){
        const products = order.items.products;
        const counts = order.items.counts;
        let washes = 0;
        let prepaid = 0;
        let extras = 0;
        let others = 0;
        let detailing = 0;
        let certificate = 0;
        let discount = parseFloat(order.totals.discount);

        const washeCats = [1, 2, 6, 7];
        for(let i = 0; i < products.length; i++){
            const p = products[i];
            const cat = p.category_id;
            const c = counts[p.id] || 0;
            const price = p.price * c;
            if(washeCats.includes(cat)){
                washes += price;
            }else if(cat == 3){
                detailing += price;
            }else if(cat == 4){
                extras += price;
            }else if(cat == 5){
                others += price;
            }else if(p.id == pids.newPrepaidCardItemId || p.id == pids.reloadPrepaidCardItemId){
                prepaid += price;
            }else if(p.id == pids.giftCertificateItemId){
                certificate += price;
            }
        }
        return {washes, detailing, prepaid, extras, others, certificate, discount};
    }

    static getPrepaidCards(order){
        const barcodes = [];
        let total = 0;
        const products = order.items.products;
        for(let i = 0; i < products.length; i++){
            const p = products[i];
            if(p.id == 10001 || p.id == 10002){
                barcodes.push(p.barcode);
                total += p.amount;
            }
        }
        return {barcodes, total};
    }

    static extractItems(order){
        const result = {washes: [], extras: [], newPrepaids: [], reloadPrepaids: [], detailing: [], otheritems: []};
        const products = order.items.products;
        const counts = order.items.counts;
        for(let i = 0; i < products.length; i++){
            const p = products[i];
            const cat = p.category_id;
            const c = counts[p.id] || 0;
            addPrt(result, p, c);
        }
        return result;
    }

}

function addPrt(obj, p, c){
    const cat = p.category_id;
    if(cat == 1){
        obj.washes.push(p.name + ' (IN & OUT)' + gct(c));
    }else if(cat == 2){
        obj.washes.push(p.name + ' (IN OR OUT)' + gct(c));
    }else if(cat == 3){
        obj.detailing.push(`${p.name} (${utils.price(p.price)})`);
    }else if(cat == 4){
        obj.extras.push(p.name + gct(c));
    }else if(cat == 5){
        obj.otheritems.push(p.name + gct(c));
    }else if(p.id == 10001){
        obj.newPrepaids.push(`${p.barcode} (${utils.price(p.amount)})`)
    }else if(p.id == 10002){
        obj.reloadPrepaids.push(`${p.barcode} (${utils.price(p.amount)})`)
    }
}

function gct(c){
    return (c > 1) ? ' x' + c : '';
}

const wsr_template = {
    date: '',
    cw: 0,
    pp: 0,
    rpp: 0,
    dt: 0,
    cash: 0,
    credit: 0,
    cash_plus_credit: 0,
    cash_vs_credit: 0,
    freeWashesValue: 0,
    invoice_ari: 0,
    prepaid: 0,
    allWashesValue: 0,
    discount: 0,
    extra: 0,
    newPrepaid: 0,
    detailingTotal: 0,
};

function wsr_modifier(obj, day){
    if(day == 'sum'){
        obj.date = 'TOTAL';
    }else{
        obj.date = time.timestampToDate(day);
    }
}

const pids = {
    newPrepaidCardItemId: 10001,
    reloadPrepaidCardItemId: 10002,
    giftCertificateItemId: 10003,
};