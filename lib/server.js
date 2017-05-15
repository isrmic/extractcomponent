const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const config = require(path.join(process.cwd(), '/component.config.js'));

function startServer(port){
    var server = http.createServer((req, res) => {

        let fileloadpath = path.join(process.cwd(), config.globalPath, 'index.html');
        let basepath = path.join(process.cwd(), config.globalPath);
        let scriptloadpath = config.build_Script.save_folder;

        staticfolder(req, res, basepath);

        res.writeHead(200, {'Content-Type':'text/html'});

        if(req.url === "/"){

            let page;

            if(fs.existsSync(fileloadpath)){

                page = fs.readFileSync(fileloadpath, 'utf8');
            }

            else
                (console.log('index.html não encontrado'), process.exit());

            res.end(page, 'utf-8');
        }


    });

    function staticfolder (req, res, basepath) {

          let contentType = 'text/html';
          let urlparse = url.parse(req.url);
          let extfilereq = path.extname(path.basename(urlparse.pathname));

          if(extfilereq){

          var mimeTypes = {

              '.html': 'text/html',
              '.js': 'text/javascript',
              '.css': 'text/css',
              '.json': 'application/json',
              '.png': 'image/png',
              '.jpg': 'image/jpg',
              '.gif': 'image/gif',
              '.wav': 'audio/wav',
              '.mp4': 'video/mp4',
              '.woff': 'application/font-woff',
              '.woff2': 'application/font-woff2',
              '.ttf': 'application/font-truetype',
              // '.ttf': 'application/font-ttf',
              '.eot': 'application/vnd.ms-fontobject',
              '.otf': 'application/font-otf',
              '.svg': 'application/image/svg+xml'

          };

          contentType = mimeTypes[extfilereq] || 'application/octet-stream';

          console.log(contentType);

          let fileloadpath = path.join(basepath, urlparse.pathname);

          if(fs.existsSync(fileloadpath)){
              console.log(fileloadpath)
              let fileload = fs.readFileSync(fileloadpath, 'utf8');

              res.writeHead(200, { 'Content-Type':contentType } );
              res.end(fileload, 'utf8');
          }
          else{

              res.writeHead(404, { "Content-type":"text/html" });
              res.end();
          }
       }
    }

    // function staticfolder (req, res, basepath) {
    //
    //   fs.readdir(basepath, (err, files) => {
    //
    //       if(err)
    //           throw err;
    //
    //       files.forEach(fileOrPath =>{
    //
    //           if(req.url.indexOf(fileOrPath) >= 0){
    //
    //               let contentType;
    //
    //               switch(path.extname(path.basename(req.url))){
    //
    //                   case '.js':
    //                       contentType = 'text/javascript';
    //                   break;
    //
    //                   case '.html':
    //                       contentType = 'text/html';
    //                   break;
    //
    //                   case 'css':
    //                       contentType = 'text/css';
    //                   break;
    //
    //                   default:
    //                       contentType = 'text/plain';
    //
    //               }
    //
    //               let fileloadpath = path.join(basepath, req.url);
    //
    //               if(fs.existsSync(fileloadpath)){
    //
    //                   let fileload = fs.readFileSync(fileloadpath, 'utf8');
    //
    //                   res.writeHead(200, {'content-type':''});
    //                   res.write(fileload);
    //               }
    //               else
    //                   res.writeHead(404);
    //
    //               res.end();
    //           }
    //
    //       });
    //
    //   });
    //
    // }

    server.listen(port ? port : 3000, err =>{
        if(err)
            throw err;
        console.log('server is started on port %d !! ', port || 3000);
    });
}
module.exports = startServer;
