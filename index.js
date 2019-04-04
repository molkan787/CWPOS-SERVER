const restify = require('restify');
const errors = require('restify-errors');
const corsMiddleware = require('restify-cors-middleware');
require('./models/index')();

const auth = require('./auth/auth');
const router = require('./routes/index');

const server = restify.createServer();

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['API-Token-Expiry']
});
server.pre(cors.preflight);
server.use(cors.actual);
server.use((req, res, next) => {
    if(req.route.path == '/auth'){
      return next();
    }else{
      const token = req.headers['authorization'];
      auth.checkToken(token).then(isValid => {
        if(isValid){
          return next();
        }else{
          return next(new errors.UnauthorizedError());
        }
      }).catch(error => {
        console.log('Error:', error);
      });
    }
  }
);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: false, requestBodyOnGet: true }));

router(server);

server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});

const reports = require('./reports/index');

reports.genDailySales(1554249600);