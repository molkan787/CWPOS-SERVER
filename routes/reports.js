const errors = require('restify-errors');

module.exports = async (req, res, next) => {
    try {
        const type = req.body;
    } catch (error) {
        return next(new errors.InternalError('ERROR:016'));
    }
};