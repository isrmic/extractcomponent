const fs = require('fs');
const { extname, join, dirname, basename } = require('path');
const serializeexports = require('./serializeexports');
const babel = require('babel-core');

if(fs.existsSync(process.cwd() + '/component.config.js'))
    config = require(process.cwd() + '/component.config.js');
else
    config = require("./default.config.js");

global.lastmodule = null;
global.maproad = [];
registermodules["modules"] = [];
global.packmoduleID = null;

var mainpattrequire = /(var|const|module[.]exports)[\w.\s=]+require[(]["'](.*?)['"][)][;]?/gi;
var patternrequire = /require[(]["'](.*?)['"][)][;]?/gi;
var patterncomments = /\*([^*]|[\r\n]|(\*([^/]|[\r\n])))*\*/;
var patterncommentm = /\/\*(\*(?!\/)|[^*])*\*\//gi;
var patternrequireconf = /require[(]["'](.*?)['"][)](\.\w+)[;]?/gi;

var pathForNodeModules = join(process.cwd(), 'node_modules');
var count = 0;

function requiremodule (filestring, _path, initialmodule, ropt){
    count++;

    /*scope 1*/
    let entrypath;
    let stringHandle = extname(filestring) === ".js" ? fs.readFileSync(filestring, 'utf8') : filestring;

    stringHandle = stringHandle.replace(patterncommentm, (x, y) => {
        if(patternrequire.test(x) || mainpattrequire.test(x)){
            x = x.split(mainpattrequire).join('');
        }
        return x;
    });

    let captureMatchsAll = stringHandle.match(mainpattrequire);
    let captureMatchsReq = stringHandle.match(patternrequire);

    let final_file = stringHandle;

    if(_path === undefined)
        fs.writeFileSync('ndepure.js', final_file);

    if(captureMatchsReq !== null || captureMatchsAll !== null){

        captureMatchsReq.forEach(match =>{

              let namemodule = match.replace(patternrequire, (x, y) => y);

              // console.log('>> :', _path, namemodule, lastmodule);

              let ModuleInfo = getInfoModule(namemodule, _path);

              // console.log('-- :', ModuleInfo)

              if(ModuleInfo !== null){

                    entrypath = ModuleInfo.basepath;

                    global.lastmodule = namemodule;

                    if(maproad.indexOf(entrypath) === -1)
                        maproad.push(entrypath);

                    let fileload;

                    let functname = basename(namemodule).replace(/[\W]/gi, "_");

                    let rmodule = initialmodule ? "modulemain" + functname : "module" + functname;

                    if(registermodules.indexOf(rmodule) === -1){

                        if(ModuleInfo.type !== "_scriptdependency"){

                            fileload = extractfile(ModuleInfo.pathfileload, namemodule, initialmodule);

                            patternrequire.test(fileload) ? fileload = requiremodule(fileload, entrypath) : null;

                        }
                        else{

                            fileload = fs.readFileSync(ModuleInfo.pathfileload, 'utf8');
                            final_file = final_file.replace(match, "null");
                        }

                        // console.log(match)

                        // final_file.split(fileload).join("");

                        // final_file += fileload;

                        // if((initialmodule || (ropt !== undefined && (ropt.typeimportvar === "blc" || ropt === "noncallapply")) ) && typereturn === 2)
                        //     final_file = final_file.split(match).join(fileload);
                        // else
                        //

                        // if(global.getComponent !== "nonregister" || extname(namemodule) === ".jsx"){
                        if(global.getComponent !== "nonregister"){

                            registermodules.push(rmodule);
                            registermodules[rmodule] = fileload;
                            registermodules["modules"].push(fileload);
                        }

                        //final_file.replace(match, `_get_module['${"module"+basename(namemodule).replace(/[\W]/gi, "_")}']`);
                        // if(extname(namemodule) !== ".jsx")
                            final_file = final_file.split(match).join(fileload);
                        // else
                        //     final_file = final_file.split(match).join("");


                  }
                  else{

                    if((initialmodule || (ropt !== undefined && (ropt.typeimportvar === "blc" || ropt === "noncallapply")) ) && typereturn === 2)
                        final_file = final_file.replace(match, "");
                    else{

                        final_file = final_file.replace(match, `_get_module['${rmodule}']`);
                    }
                 }
              }

              final_file = final_file.split(match).join("{}");
        });
    }
    // console.log(stringHandle);
    if(patternrequire.test(final_file)){

        return requiremodule(final_file, entrypath);
    }
    return resolveTypeEnv(final_file);
}

function extractfile (loadinfo, namemodule, cond){

      // console.log(global.lastmodule, namemodule);

      let file = fs.readFileSync(loadinfo, 'utf8');

      file = serializeexports(file);

      if(extname(namemodule) === ".jsx")
          file = babel.transform(file, {presets:["react"]}).code;

      let functname = basename(namemodule).replace(/[\W]/gi, "_");

      let rmodule = cond ? "modulemain" + functname : "module" + functname;


      let beforeEndScop = /[^.]{1}exports[.][a-zA-Z]+/g.test(file) ? `\nmodule = {exports};\n` : '';
      let endscopReturn = /exports[.]default/g.test(file) ? `module.exports.default;` : 'module.exports;'

      file = `(_get_module['${rmodule}'] = (function () {\nexports = {};\n${file}\n${beforeEndScop}\n \nreturn ${endscopReturn}\n})())`;
      // file = file.split("module.exports = ").join("return ");

      return file;
}

function resolveTypeEnv(filestring){
    return filestring.split("process.env.NODE_ENV").join(`'${config.NODE_ENV}'`);
}

function getInfoModule (namemodule, respath) {

    let infos = null;
    let pathmodule = join(pathForNodeModules, namemodule);
    let fileloadname;
    let pathfileload;


    if(extname(namemodule) === "" || (extname(namemodule) !== "" && !/[.]json/gi.test(extname(namemodule))) ){

        if(namemodule.indexOf(".") === -1 && fs.existsSync(pathmodule)){

            let packageinfo = fs.readFileSync(join(pathmodule, 'package.json'), 'utf8');

            packageinfo = JSON.parse(packageinfo);

            if(packageinfo.main !== undefined)
                fileloadname = packageinfo.main;

            // console.log(fileloadname, namemodule, join(pathmodule, fileloadname));


            if( (fileloadname !== undefined && !fs.existsSync(join(pathmodule, fileloadname)))){

            if(extname(namemodule) === "" && fs.existsSync(join(pathmodule, fileloadname + ".js")))
                fileloadname += ".js";

            else if( extname(namemodule) === "" && fs.existsSync(join(pathmodule, namemodule + ".js") ))
                fileloadname = namemodule + ".js";
            else
                fileloadname = "index.js";

            }
            else if(fileloadname === undefined)
                fileloadname = "index.js";

            pathfileload = join(pathmodule, fileloadname);

            packmoduleID = namemodule.replace("-", "_")

            infos = { pathmodule, fileloadname, pathfileload, basepath:dirname(pathfileload), type:'nodemodule', ext:extname(pathfileload) };
        }


        else if(namemodule.indexOf(".") !== -1 || namemodule.indexOf("/") !== -1){

            if((fs.existsSync(pathmodule) || fs.existsSync(pathmodule + ".js")) && !(fs.existsSync(join(respath, namemodule)) || fs.existsSync(join(respath, namemodule + ".js")))){

                if(extname(pathmodule) === ".js")
                    pathfileload = pathmodule;
                else if(extname(pathmodule) !== ".jsx")
                    pathfileload = pathmodule + ".js";
                else
                    pathfileload = pathmodule;
            }
            else {

                pathmodule = join(respath, namemodule);
                if(fs.existsSync(pathmodule))
                    pathfileload = pathmodule;

                else if(fs.existsSync(pathmodule + ".js"))
                    pathfileload = pathmodule + ".js"
                // else
                //     console.log(namemodule, respath)
            }

            if(pathfileload !== undefined){

              fileloadname = basename(pathfileload);

              infos = { pathmodule, fileloadname, pathfileload, basepath:dirname(pathfileload), type:'scriptdependency', ext:extname(pathfileload) };

            }
            else {

                pathfileload = null;

                for(var i = 0; i < maproad.length; i++){

                    pathfileload = join(maproad[i], namemodule) + ".js";
                    if(fs.existsSync(pathfileload)){
                        pathmodule = maproad[i];
                        break;
                    }
                }

                if(pathfileload !== null){
                    fileloadname = basename(pathfileload);
                    infos = { pathmodule, fileloadname, pathfileload, basepath:dirname(pathfileload), type:'_scriptdependency', ext:extname(pathfileload) };
                }
            }
        }
    }
    // console.log(namemodule, infos)
    return infos;
}

function getmodule(filenNameOrString, _typereturn, unopt, _path){

    global.typereturn = _typereturn;

    var res = filenNameOrString;

    if(patternrequire.test(filenNameOrString)){
        res = requiremodule(filenNameOrString, _path || process.cwd(), true, unopt);
        // console.log(res)
        if(_typereturn === 1)
            return `(function(module, exports, _get_module){\nmodule.exports = exports;\n${res}\n}).apply(this, [{}, {}, []]);`
        else if(_typereturn === 2)
            res = res;
    }
    // console.log(filenNameOrString)
    return res;
}
module.exports = getmodule;
