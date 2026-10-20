import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let file;try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/__md_preview'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({app:'md-atelier',root}));return;}file=path.resolve(root,'.'+decodeURIComponent(pathname));}catch{res.writeHead(400).end();return;}if(file===root)file=path.join(root,'collector.html');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);});});
const port=Number(process.env.MD_ATELIER_PORT||4199);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('MD_ATELIER_PORT must be an integer from 1 to 65535');
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/collector.html`));
