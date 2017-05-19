const fs = require('fs');
const path = require('path');
const enc = require('./enc.js');

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

      lvuecomp = fs.readFileSync(_pathcomponent);

      compact += `Compact_${index} => {\npath -> ${config.components_folder};\nname -> ${file};\ncomponent -> ${enc(lvuecomp, 1, keypass || undefined)}\n}\n\n`;

    });

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
    let patterinfos = /Compact[_]?[0-9]{1,}[\s]*=>[\s]*[{]([\n\w\s ->]+)[}]/gi;
    let reg_selectprop = /[a-zA-Z]+\s{1}->([\w<>/.:\- a-fA-F]+)/gi

    let pathcomponent = path.join(process.cwd(), config.components_folder);

    let filename = args[0] + ".compact";
    let password = args[1];

    let pathfile = path.join(process.cwd(), filename);


    if(!fs.existsSync(pathfile))
        (console.log(">>> file not found !! "), process.exit())
    else {

        let fileload = fs.readFileSync(pathfile, 'utf8');

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

                    let namecompo = objdec.name;

                    fs.writeFile(path.join(process.cwd(), objdec.path, objdec.name), enc(objdec.component, 2, password), (err) =>{
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
