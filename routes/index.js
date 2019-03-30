const asd = require('./asd');
const auth = require('./auth');
const order = require('./order');
const orders = require('./orders');
const prepaid = require('./prepaid');
const getPrepaids = require('./getPrepaids');
const getLoyalty = require('./getLoyalty');
const loyalty = require('./loyalty');
const capture = require('./capture');
const client = require('./client');
const clients = require('./clients');
const users = require('./users');
const product = require('./product');
const delProduct = require('./delProduct');

module.exports = server => {
    server.get('/asd', asd);
    server.get('/client/:phone', client);

    server.post('/clients', clients);
    server.post('/orders', orders);
    server.post('/prepaid/get', getPrepaids);
    server.post('/loyalty/get', getLoyalty);
    server.post('/users', users);

    server.post('/auth', auth);
    server.post('/order', order);
    server.post('/product', product);
    server.post('/prepaid/:action', prepaid);
    server.post('/loyalty/:action', loyalty);
    server.post('/capture/:method', capture);

    server.del('/product/:id', delProduct);
};