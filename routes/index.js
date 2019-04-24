const asd = require('./asd');
const auth = require('./auth');
const order = require('./order');
const orders = require('./orders');
const prepaid = require('./prepaid');
const getPrepaids = require('./getPrepaids');
const getLoyalty = require('./getLoyalty');
const loyalty = require('./loyalty');
const capture = require('./capture');
// const clientHistory = require('./clientHistory');
const clcref = require('./clcref');
const client = require('./client');
const editClient = require('./editClient');
const delClient = require('./delClient');
const clients = require('./clients');
const users = require('./users');
const user = require('./user');
const delUser = require('./delUser');
const product = require('./product');
const delProduct = require('./delProduct');
const reports = require('./reports');
const download = require('./download');
const setReceiptFlag = require('./setReceiptFlag');
const settings = require('./settings');

module.exports = server => {
    server.get('/asd', asd);
    // server.get('/client_history/:phone', clientHistory);
    server.get('/clcref/:by/:ref', clcref);
    server.get('/client/:by/:ref', client);
    server.get('/download/:filename/:signature/:returnFilename', download);
    server.get('/settings', settings.get);

    server.post('/clients', clients);
    server.post('/orders', orders);
    server.post('/prepaid/get', getPrepaids);
    server.post('/loyalty/get', getLoyalty);
    server.post('/users', users);
    server.post('/user', user);
    server.post('/setReceiptFlag', setReceiptFlag);

    server.post('/reports', reports);
    server.post('/auth', auth);
    server.post('/order', order);
    server.post('/product', product);
    server.post('/prepaid/:action', prepaid);
    server.post('/loyalty/:action', loyalty);
    server.post('/capture/:method', capture);
    server.post('/client', editClient);
    server.post('/settings', settings.set);

    server.del('/product/:id', delProduct);
    server.del('/user/:id', delUser);
    server.del('/client/:id', delClient);
};