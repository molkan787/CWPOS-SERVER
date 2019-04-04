const time = require('./time');

module.exports = class Utils{
    static price(value){
        const neg = value < 0;
        const val = neg ? -value : value;
        return (neg ? '- ' : '') + '$' + val.toFixed(2);
    }

    static price_m(value){
        return this.price(value / 100);
    }

    static rndSlug(suffix){
        return time.todayDate() + ' - ' + this.rndStr(8) + (suffix || '');
    }

    static rndStr(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < length; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }
}