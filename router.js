const Web3 = require('web3');
const Router=require('@koa/router'); 
const config = require('./config.json');            //import config file
const web3 = new Web3(process.env.INFURA_URL);
const router = new Router(); 

const cTokens={                         //add the web3 contract instance for cBat and cDai
    cBat: new web3.eth.Contract(
        config.cTokenAbi,
        config.cBatAddress
    ),
    cDai: new web3.eth.Contract(
        config.cTokenAbi,
        config.cDaiAddress
    )
}

router.get('/tokenBalance/:cToken/:address', async ctx=>{    //here we interact with compound by creating our 1st endpoint                                   
    const cToken=cTokens[ctx.params.cToken];                 //we will return the token balance for a specific address in compound
    if(typeof cToken==='undefined'){                         //the route is tokenBalance and it has two parameters 1st the name of the cToken and the address of the owner
        ctx.status=400;                                      //then we give it an async callback ctx. so we extract the correct web3 contract instance
        ctx.body={                                           //and we reference the parameter of the url with ctx.params.cToken whic is something given to us by koa
            error: `cToken ${ctx.params.cToken} does not exist`                                          // check if some one uses the wrong token send 400 error and in the body return the error
        };
         return;                                             //continue      
    }
    try{
        const tokenBalance =await cToken                     //after the error we call the the smart contract of compound for our balance
            .methods.balanceOfUnderlying(ctx.params.address) //pass the function the parameter we got in the url
            .call();
            ctx.body={                                      //send a json response and specify the cToken,addressand balance
                cToken:ctx.params.cToken,
                address: ctx.params.address,
                tokenBalance: tokenBalance
    };   
    
    }catch(e) {
        console.log(e);                                         //This address has some cDai / Dai: 0x0d0289e9f3eae696fa38e86fc4456228dc1792a7 You can find other addresses like this on Etherscan:
        ctx.status=500;                                         //Search for the contract of cDai, Search the last transactions, inspect the sending address, and it should have some dai/cDai
        ctx.body={                                              //You can try out the API like this:curl http://localhost:3000/tokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
            error: 'internal server error'                      //curl http://localhost:3000/cTokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
        };
    }                                                           
});
router.get('/cTokenBalance/:cToken/:address', async ctx=>{    //here we interact with compound by creating our 1st endpoint                                   
    const cToken=cTokens[ctx.params.cToken];                 //we will return the token balance for a specific address in compound
    if(typeof cToken==='undefined'){                         //the route is tokenBalance and it has two parameters 1st the name of the cToken and the address of the owner
        ctx.status=400;                                      //then we give it an async callback ctx. so we extract the correct web3 contract instance
        ctx.body={                                           //and we reference the parameter of the url with ctx.params.cToken whic is something given to us by koa
            error: `cToken ${ctx.params.cToken} does not exist`                                          // check if some one uses the wrong token send 400 error and in the body return the error
        };
         return;                                             //continue      
    }
    try{
        const cTokenBalance =await cToken                     //after the error we call the the smart contract of compound for our balance
            .methods.balanceOf(ctx.params.address)           //pass the function the parameter we got in the url
            .call();
            ctx.body={                                      //send a json response and specify the cToken,addressand balance
                cToken:ctx.params.cToken,
                address: ctx.params.address,
                cTokenBalance: cTokenBalance
    };   
    
    }catch(e) {
        console.log(e);                                         //This address has some cDai / Dai: 0x0d0289e9f3eae696fa38e86fc4456228dc1792a7 You can find other addresses like this on Etherscan:
        ctx.status=500;                                         //Search for the contract of cDai, Search the last transactions, inspect the sending address, and it should have some dai/cDai
        ctx.body={                                              //You can try out the API like this:curl http://localhost:3000/tokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
            error: 'internal server error'                      //curl http://localhost:3000/cTokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
        };
    }                                                           
});
router.post('/mint/:cToken/:amount', async ctx=>{    //here we interact with compound by creating our 3rd endpoint which is a post route                                   
    const cToken=cTokens[ctx.params.cToken];                 //we will modify the token balance by a specific amount in compound
    if(typeof cToken==='undefined'){                         //the route is mint and it has two parameters 1st the name of the cToken and the amount of cDai we want to create
        ctx.status=400;                                      //then we give it an async callback ctx. so we extract the correct web3 contract instance
        ctx.body={                                           //and we reference the parameter of the url with ctx.params.cToken whic is something given to us by koa
            error: `cToken ${ctx.params.cToken} does not exist`   // check if some one uses the wrong token send 400 error and in the body return the error
        };
         return;                                             //continue      
    }
    const tokenAddress=await cToken.methods.underlying().call();     //we get the address of the ERC20 token
    const token = new web3.eth.Contract(                            //create a web3 contract intance that can point to this erc20 token
        config.ERC20Abi,                                            //from the config.json file
        tokenAddress                                         
    ) 
    await token.methods.approve(cToken.options.address, ctx.params.amount)
                        .send({from:adminAddress});                 //now you can send your tokens to the cToken contract in compound

    try{
        await cToken                                        //after the error we call the the smart contract of compound for our balance
            .methods.mint(ctx.params.amount) //pass the function the parameter we got in the url
            .send({from:adminAddress});
            ctx.body={                                      //send a json response and specify the cToken,addressand balance
                cToken:ctx.params.cToken,
                address: adminAddress,
                amountMinted: ctx.params.amount
    };   
    
    }catch(e) {
        console.log(e);                                         //This address has some cDai / Dai: 0x0d0289e9f3eae696fa38e86fc4456228dc1792a7 You can find other addresses like this on Etherscan:
        ctx.status=500;                                         //Search for the contract of cDai, Search the last transactions, inspect the sending address, and it should have some dai/cDai
        ctx.body={                                              //You can try out the API like this:curl http://localhost:3000/tokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
            error: 'internal server error'                      //curl http://localhost:3000/cTokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
        };
    }                                                           
});
router.post('/redeem/:cToken/:amount', async ctx=>{    //here we interact with compound by creating our 3rd endpoint which is to redeem our original tokens from compound                                  
    const cToken=cTokens[ctx.params.cToken];                 //we will modify the token balance by a specific amount in compound
    if(typeof cToken==='undefined'){                         //the route is mint and it has two parameters 1st the name of the cToken and the amount of cDai we want to create
        ctx.status=400;                                      //then we give it an async callback ctx. so we extract the correct web3 contract instance
        ctx.body={                                           //and we reference the parameter of the url with ctx.params.cToken whic is something given to us by koa
            error: `cToken ${ctx.params.cToken} does not exist`   // check if some one uses the wrong token send 400 error and in the body return the error
        };
         return;                                             //continue      
    }
    
    try{
        await cToken                                         //after the error we call the the smart contract of compound for our balance
            .methods.redeem(ctx.params.amount)                //pass the function the parameter we got in the url
            .send({from:adminAddress});
            ctx.body={                                      //send a json response and specify the cToken,addressand balance
                cToken:ctx.params.cToken,
                address: adminAddress,
                amountRedeemed: ctx.params.amount
    };   
    
    }catch(e) {
        console.log(e);                                         //This address has some cDai / Dai: 0x0d0289e9f3eae696fa38e86fc4456228dc1792a7 You can find other addresses like this on Etherscan:
        ctx.status=500;                                         //Search for the contract of cDai, Search the last transactions, inspect the sending address, and it should have some dai/cDai
        ctx.body={                                              //You can try out the API like this:curl http://localhost:3000/tokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
            error: 'internal server error'                      //curl http://localhost:3000/cTokenBalance/cDai/0x0d0289e9f3eae696fa38e86fc4456228dc1792a7
        };
    }                                                           
});
module.exports=router;