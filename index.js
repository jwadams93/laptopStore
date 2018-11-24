const fs = require('fs'); //File system module
const http = require('http');
const url = require('url');

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8'); //If we do not specify utf-8, it will return a buffer rather than a file. 
//__dirname is a variable defined in node that its the home directory 
//We do this synchronously because this is when a user comes to the page. They only do this once. All readFiles following 
//will use async because we can only run on one thread, and dont want to block this for all other users when something may take a long time.

//Parse json into object
const laptopData = JSON.parse(json);

//Create server. callback function with parameters request and response
//Fired every time someone accesses the server
const server = http.createServer((req,res) => {

    const pathName = url.parse(req.url, true).pathname; //true == The pathName will be parsed into an object
    const id = url.parse(req.url, true).query.id;   //get the query (url/products/?id=) from the URL. Extract the id


    //PRODUCTS OVERVIEW
    if(pathName === '/products' || pathName === '/'){
        res.writeHead(200, { 'Content-type': 'text/html'}); //Header! Status code 200 means OK, then we say what responses type we're sending
        
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {

            let overviewOutput = data;

            //CARD TEMPLATE (we put it inside the product template callback because it must be written ONLY after the products page is read.)
            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {

                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);

                res.end(overviewOutput);
                
            });
        });


    //LAPTOP DETAIL
    }else if(pathName === '/laptop' && id < laptopData.length){
        res.writeHead(200, { 'Content-type': 'text/html'}); //Header! Status code 200 means OK, then we say what responses type we're sending
        
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => {
            const laptop = laptopData[id];
            
            const output = replaceTemplate(data, laptop);

            res.end(output);
        });


    //IMAGES
    }else if((/\.(jpg|jpeg|png|gif)$/i).test(pathName)){
        
        fs.readFile(`${__dirname}/data/img/${pathName}`, (err, data) => {
            res.writeHead(200, { 'Content-type': 'image/jpg'});
            res.end(data);
        });


    //URL NOT FOUND 
    }else{
        res.writeHead(404, { 'Content-type': 'text/html'}); //Header! Status code 404 means error
        res.end('URL was not found on the server!');
    }
});

//Port and IP to listen on. (IP = local host in this case)
server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for requests');
});

function replaceTemplate(originalHtml, laptop){
    let output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.id);

    return output;
}