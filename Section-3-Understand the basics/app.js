const http = require('http');
const fs = require('fs');


const server = http.createServer((req,res) =>{
    const url = req.url;
    if(url === '/message'){
        const fileData = fs.readFile('./test.txt','utf8', (err,data)=> {
            if(err){
                console.log(err);
            }
            res.setHeader('content-type','text/plain');
            res.end(data);
        });
     return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.write(`<html lang="en"><head><title>${req.url}</title></head><body>HELLO MOHSIN</body></html>`);
    res.end();
});

server.listen(4000)

