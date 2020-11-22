require('dotenv').config();                         //gives acces to .env file
const Koa = require('koa');                         //import koa
const app = new Koa();                              //instantiate app an instance of koa
const Router=require('@koa/router');                //import koa router
const router = require('./router');                        //instantiate a router instance


router.get('/', ctx=>{                              //define our route .get where we define the url of the route and give it a callback function.The 1st argument of the context object ctx where you can access details and start the response.                         
    ctx.body="the ace of spades"                    // in order to answer you have to populate the body object inside ctx
});
app
  .use(router.routes());                            //inject the router in the app

app.listen(process.env.POTR || 3000);                                   //start the server at port 3000 








//from here you need to create a .env file and connect to the ethereum blockchain via infura.
//paste the http inside INFURA_URL=https://mainnet.infura.io