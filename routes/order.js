const errors = require('restify-errors');
const Order = require('../models/Order');

module.exports = async (req, res, next) => {
    const {username, password} = req.body;
    try {
        const token = await auth.login(username, password);
        if(token){
            res.send({token});
        }else{
            return next(new errors.UnauthorizedError('Authentication failed'));
        }
        
    } catch (error) {
        return next(new errors.InternalError('Error:003 ' + error));
    }
};