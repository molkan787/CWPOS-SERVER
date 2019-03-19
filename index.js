const restify = require('restify');
const errors = require('restify-errors');
require('./models/index')();

const auth = require('./auth/auth');
const router = require('./routes/index');

const server = restify.createServer();

server.use(
  function crossOrigin(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);
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
server.use(restify.plugins.bodyParser());

router(server);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});