const asd = require('./asd');
const auth = require('./auth');
const order = require('./order');
const prepaid = require('./prepaid');
const loyalty = require('./loyalty');
const capture = require('./capture');

module.exports = server => {
    server.get('/asd', asd);
    server.post('/auth', auth);
    server.post('/order', order);
    server.post('/prepaid/:action', prepaid);
    server.post('/loyalty/:action', loyalty);
    server.post('/capture/:method', capture);
};