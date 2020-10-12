
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
${Object.keys(this.headers).map(key=>`${key}: ${this.headers[key]}`).join('\r\n')}\r
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
       this.WAITING_STATUS_LINE = 0;
       this.WAITING_STATUS_LINE_END = 1;
       this.WAITING_HEADER_NAME = 2;
       this.WAITING_HEADER_SPACE = 3;
       this.WAITING_HEADER_VALUE = 4;
       this.WAITING_HEADER_LINNE_END = 5;
       this.WAITING_HEADER_BLOCK_END = 6;
       this.WAITING_BODY = 7;

       this.current = this.WAITING_STATUS_LINE;
       this.statusline = "";
       this.headers = {};
       this.headerName = "";
       this.headerValue = "";
       this.bodyParser = null; 
   }

   get isFinished(){
       return this.bodyParser && this.bodyParser.isFinished;
   }

   get response(){
       this.statusline.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
       return {
          statusCode: RegExp.$1,
          statusText: RegExp.$2,
          headers: this.headers,
          body: this.bodyParser.content.join('')
       }
   }

   receive(string){
       for(let i=0;i<string.length;i++){
          //像状态机那样处理字符串
          this.receiveChar(string.charAt(i)); 
       } 
   }

   receiveChar(char){
      if(this.current === this.WAITING_STATUS_LINE){
         if(char === '\r'){
            this.current = this.WAITING_STATUS_LINE_END;
         }else{
            this.statusline += char;
         }
      }else if(this.current === this.WAITING_STATUS_LINE_END){
         if(char === '\n'){
            this.current = this.WAITING_HEADER_NAME;
         }
      }else if(this.current === this.WAITING_HEADER_NAME){
         if(char === ":"){
            this.current = this.WAITING_HEADER_SPACE;
         }else if(char === '\r'){
             //body前的\r符号
            this.current = this.WAITING_HEADER_BLOCK_END;
            if(this.headers['Transfer-Encoding'] === 'chunked'){
                 this.bodyParser = new TrunkedBodyParser();
            }
         }else{
            this.headerName += char;
         }
      }else if(this.current === this.WAITING_HEADER_SPACE){
          if(char === " "){
             this.current = this.WAITING_HEADER_VALUE;
          }
      }else if(this.current === this.WAITING_HEADER_VALUE){
          if(char === "\r"){
             this.current = this.WAITING_HEADER_LINNE_END;
             this.headers[this.headerName] = this.headerValue;
             this.headerName = "";
             this.headerValue = "";
          }else{
             this.headerValue += char;
          }
      }else if(this.current === this.WAITING_HEADER_LINNE_END){
            if(char === "\n"){
               this.current = this.WAITING_HEADER_NAME;
            }
      }else if(this.current === this.WAITING_HEADER_BLOCK_END){
            if(char === "\n"){
               this.current = this.WAITING_BODY;
            }
      }else if(this.current === this.WAITING_BODY){
           this.bodyParser.receiveChar(char); 
      }
      
 
   }

}

class TrunkedBodyParser{
   // 解析body内容
   constructor(){
         this.WAITING_LENGTH = 0;
         this.WAITING_LENGTH_LINE_END = 1;
         this.READING_TRUNK = 2;
         this.WAITING_NEW_LINE = 3;
         this.WAITING_NEW_LINE_END = 4;
         this.length = 0;
         this.content = [];
         this.isFinished = false;
         this.current = this.WAITING_LENGTH;    
   }

   receiveChar(char){
         //body状态机
         if(this.current === this.WAITING_LENGTH){
             if(char === '\r'){ 
                if(this.length === 0){
                   this.isFinished = true; //读取长度完一行
                }
                this.current = this.WAITING_LENGTH_LINE_END
             }else{
                this.length *= 16;//读取的第一行从左到右16进制每个字符相加,得到完整的字符长度
                this.length += parseInt(char,16);
             }   
         } else if(this.current === this.WAITING_LENGTH_LINE_END){
               if(char === '\n'){
                  this.current = this.READING_TRUNK //读取内容
               }
         } else if(this.current === this.READING_TRUNK){
               this.content.push(char);
               this.length--;
               if(this.length === 0){
                  this.current = this.WAITING_NEW_LINE;
               }
         } else if(this.current === this.WAITING_NEW_LINE){
             if(char === '\r'){
                this.current = this.WAITING_NEW_LINE_END;
             }
         } else if (this.current === this.WAITING_NEW_LINE_END){
             if(char === '\n'){
                this.current = this.WAITING_LENGTH; //重新读取下一行
             }
         }
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

  console.log('res =>',response);

}();

