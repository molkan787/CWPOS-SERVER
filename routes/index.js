const asd = require('./asd');
const auth = require('./auth');
const order = require('./order');

module.exports = server => {
    server.get('/asd', asd);
    server.post('/auth', auth);
    server.post('/order', order);
};