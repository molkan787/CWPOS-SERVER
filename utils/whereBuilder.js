const { raw } = require('objection');
const time = require('./time');

function _add(cc, raw){
    return (cc ? cc + ' AND ' : '') + raw;
}

module.exports = class WhereBuilder{

    static dateRange(params){
        let q = '';
        if(params.date_from)
            q = 'date_added >= ' + params.date_from;
        if(params.date_to)
            q = _add(q, 'date_added <= ' + time.addDay(params.date_to));

        return raw(q);
    }

}