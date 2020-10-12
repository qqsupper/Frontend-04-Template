
const net = require('net');
let connection;

// 客服端发送请求
class Request{
   constructor (options){
      this.methods = options.methods || "GET";
      this.host = options.host;
      this.port = options.port || 80;
      this.path = options.path || "/";
      this.body = options.body || {};
      this.headers = options.headers || {};
      if(!this.headers["Content-Type"]){
        this.headers["Content-Type"] = "application/x-www-form-urlencoded"; //headers里面必须要有Content-Type,不然Body无法解析
      }

      if(this.headers["Content-Type"] === "application/json"){
        this.bodyText = JSON.stringify(this.body);
      }
      else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
         this.bodyText = Object.keys(this.body).map(key => `${key} = ${encodeURIComponent(this.body[key])}`).join("&");
      }

      this.headers["Content-Length"] = this.bodyText.length;
   }

   toString(){
      //  request发送格式

       return  `${this.methods} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key=>`${key}:${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
   }

   send(){
      return new Promise((resolve,reject) =>{
         const parser = new ResponseParser; 
         if(connection){
             connection.write(this.toString());
         }else{
             connection=net.createConnection({
                host: this.host,
                port: this.port
             },()=>{
                console.log(this.toString())
                connection.write(this.toString());
             })
         }

         connection.on('data',(data)=>{
             console.log(data.toString());
             parser.receive(data.toString());
             if(parser.isFinished){
                resolve(parser.response);
                connection.end();
             }
         });

         connection.on('error',(err)=>{
             console.log(err)
             reject(err);
             connection.end();
         })


      })
   }
}

//返回解析
class ResponseParser{
   constructor(){

   }
    
   receive(string){
       for(let i=0;i<string.length;i++){
          //像状态机那样处理字符串
          this.receiveChar(string.charAt(i)); 
       } 
   }

   receiveChar(char){

   }

}





void async function(){

  let request = new Request({
     methods: "POST",
     host: "127.0.0.1",
     port: "8088",
     path: "/",
     headers: {
        ["X-Foo2"]: "customed"
     },
     body: {
        name: "fan"
     }
  });

  let response = await request.send();

  console.log(response);

}();

