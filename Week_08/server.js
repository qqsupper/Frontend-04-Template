const http = require('http');
const fs = require('fs');


http.createServer((request,response)=>{
   let body = [];
   request.on('error',error=>{
    console.log(error)
   }).on('data',chunk=>{
     console.log(2,chunk)
     body.push(chunk)
    //  body.push(chunk.toString());
   }).on('end',()=>{
     body = Buffer.concat(body).toString();
     console.log("body:",body);
    //  response.writeHead(200, {'Content-Type':'text/html'});
    //  response.end('hello world  ');
   })

   fs.readFile('./test.html',(err,data)=>{
    response.writeHead(200, {'Content-Type':'text/html'});
    if(err){
       response.end('500')
    }else{
       response.end(data)
    }
   })
}).listen(8088)



console.log('server started');


  