const fs = require('fs');
const path = require('path');
const enc = require('./enc.js');
const mkdirp = require('mkdirp');

if(fs.existsSync(process.cwd() + '/component.config.js'))
    config = require(process.cwd() + '/component.config.js');
else
    config = require("./default.config.js");

function compact (args){

    _pathfoldercomponente = path.join(process.cwd(), config.components_folder);

    let dirfiles = fs.readdirSync(_pathfoldercomponente);

    let filename = args[0];
    let keypass = args[1];

    let compact = '';

    dirfiles.forEach((file, index) =>{

      let _pathcomponent = path.join(_pathfoldercomponente, file);

      if(path.extname(file) === ""){

          let subdirfile = fs.readdirSync(_pathcomponent);

          subdirfile.forEach((sfile, sindex) =>{

              let slvuecomp = fs.readFileSync(path.join(_pathcomponent, sfile))

              compact += `Compact_${index}_${sindex} => {\npath -> ${path.join(config.components_folder, file)};\nname -> ${sfile};\ncontent -> ${enc(slvuecomp, 1, keypass || undefined)}\n}\n\n`;
          });
          return;
      }

      lvuecomp = fs.readFileSync(_pathcomponent);

      compact += `Compact_${index} => {\npath -> ${config.components_folder};\nname -> ${file};\ncontent -> ${enc(lvuecomp, 1, keypass || undefined)}\n}\n\n`;

    });

    let entrys = config.entry.constructor === Array ? config.entry : config.entry.constructor === String ? [config.entry] : (console.log("entry definido incorretamente !! "), process.exit());

    entrys.forEach((entry, index) =>{

        let pathentry = path.join(process.cwd(), entry);

        if(fs.existsSync(pathentry)){
            let entryload = fs.readFileSync(pathentry);
            console.log(pathentry);
            compact += `Compactentry_${index} => {\npath -> ${path.dirname(entry)};\nname -> ${path.basename(entry)};\ncontent -> ${enc(entryload, 1, keypass || undefined)}\n}\n\n`;
        }
        else
            return;
    });

    compact = enc(compact, 1, 'extractcomponent');

    fs.writeFile( (filename || 'components') + '.compact', compact, err =>{
        if(err)
            throw err;
        console.log('>>> compact components sucessfull !!');
    });
}

function descompact (args){

    /**
        args[0] === filename
        args[1] === key for decrypt
    */

    // let patterinfos = /Compact[_]?[0-9]{1,}[\s]*=>[\s]*[{](([^\n]*\n+)+)[}]/gi;
    let patterinfos = /(Compact|Compactentry)([_0-9])+[\s]*=>[\s]*[{]([\n\w\s\\ ->]+)[}]/gi;
    let reg_selectprop = /[a-zA-Z]+\s{1}->([\w<>/.:\-\\ a-fA-F]+)/gi

    // let pathcomponent = path.join(process.cwd(), config.components_folder);

    let filename = args[0] + ".compact";
    let password = args[1];

    let pathfile = path.join(process.cwd(), filename);


    if(!fs.existsSync(pathfile))
        (console.log(">>> file not found !! "), process.exit())
    else {

        let fileload = fs.readFileSync(pathfile, 'utf8');

        fileload = enc(fileload, 2, 'extractcomponent');
        fs.writeFileSync('test.txt', fileload);
        let resinfo = fileload.match(patterinfos);

        if(resinfo !== null){

            let objdec = {};

            resinfo.forEach(info =>{

                let reseachinfo = info.match(reg_selectprop);

                if(reseachinfo !== null){

                    reseachinfo.forEach(eachinfo =>{

                        let resultdec = eachinfo.split('-> ');
                        // console.log(resultdec)
                        objdec[resultdec[0].replace(" ", "")] = resultdec[1];

                    });
                    console.log(objdec)
                    let namecompo = objdec.name;
                    let pathsavedescompact = path.join(process.cwd(), objdec.path, objdec.name);

                    if(!fs.existsSync(path.dirname(pathsavedescompact)))
                        mkdirp.sync(path.dirname(pathsavedescompact));
                    console.log(info)
                    fs.writeFile(pathsavedescompact, enc(objdec.content, 2, password), (err) =>{
                        if(err)
                            throw err;
                        console.log(">>> descompact %s sucessfull ", namecompo);
                    });
                }
            });
        }
    }
}

module.exports = {compact, descompact};
