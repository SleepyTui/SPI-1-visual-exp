import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));const port=Number(process.env.SCALE_STREET_PORT||4178);
const require=createRequire(import.meta.url);require('./data.js');require('./catalog-v2.js');require('./studio-v6.js');require('./controls-v3.js');
async function saveDefaults(req,res){
 if(req.headers.origin!==`http://127.0.0.1:${port}`||req.headers['x-scale-street-defaults']!=='capture-v6'||!req.headers['content-type']?.startsWith('application/json')){res.writeHead(403).end('Forbidden');return;}
 let body='';for await(const chunk of req){body+=chunk;if(body.length>1024*1024){res.writeHead(413).end('Too large');return;}}
 try{const raw=JSON.parse(body),settings=StreetControls.validate(raw),snapshot={schema:'scale-street-settings',version:1,settings};fs.writeFileSync(path.join(root,'user-defaults-v6.json'),JSON.stringify(snapshot,null,2));fs.writeFileSync(path.join(root,'user-defaults-v6.js'),'globalThis.STUDIO_SAVED_DEFAULTS='+JSON.stringify(snapshot)+';\n');
 const bundled='C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',python=process.env.SCALE_STREET_PYTHON||(fs.existsSync(bundled)?bundled:'python');execFile(python,[path.join(root,'package_v2.py')],{cwd:root,windowsHide:true,timeout:30000},err=>{res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({saved:true,packageUpdated:!err}));});
 }catch{res.writeHead(400).end('Invalid settings');}
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end('Bad request');return;}if(req.method==='GET'&&relative==='/__scale_street_preview'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({app:'scale-street',root}));return;}if(req.method==='POST'&&relative==='/__studio_defaults'){saveDefaults(req,res);return;}if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end('Method not allowed');return;}const target=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));const rel=path.relative(root,target);if(rel.startsWith('..')||path.isAbsolute(rel)||rel.split(path.sep).some(p=>p.startsWith('.'))){res.writeHead(403).end('Forbidden');return;}fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});});
server.listen(port,'127.0.0.1',()=>console.log(`Scale Street preview: http://127.0.0.1:${port}`));
