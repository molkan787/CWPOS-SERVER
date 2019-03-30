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
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});
server.pre(cors.preflight);
server.use(cors.actual);
server.use((req, res, next) => {
    if(req.route.path == '/auth'){
      return next();
    }else{
      auth.checkToken('mwdIeBRxwZTD88Qp1MAHky1eh8pbJL').then(isValid => {
        if(isValid){
          return next();
        }else{
          return next(new errors.UnauthorizedError());
        }
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