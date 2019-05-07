const { raw } = require('objection');
const time = require('./time');

function _add(cc, raw){
    return (cc ? cc + ' AND ' : '') + raw;
}

module.exports = class WhereBuilder{

    static dateRange(params, dateProp, extra){
        const colName = dateProp || 'date_added';
        let q = '';
        if(params.date_from)
            q = colName + ' >= ' + params.date_from;
        if(params.date_to)
            q = _add(q, colName + ' < ' + time.addDay(params.date_to));

        if(extra)
            q = _add(q, extra);

        return raw(q);
    }

}