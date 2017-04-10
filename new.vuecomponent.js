#!/usr/bin/env node

var fs = require('fs');
var mkdirp = require('mkdirp');
var unzip = require('unzip');

var usr_arguments = process.argv.slice(2);
var execdir = process.cwd();


switch(usr_arguments[0]){

    case "newcomponent":

        var config;

        if(fs.existsSync(execdir + '/component.config.js'))
            config = require(execdir + '/component.config.js');
        else
            config = require("./lib/default.config.js");

        var file = fs.readFileSync(__dirname + "/lib/.default_component", 'utf8');

        if(fs.existsSync("./" + config.components_folder + "/" + usr_arguments[1] + ".vue"))
            throw new Error('this component file already exist');

        file = file.replace(/{{name}}/i, usr_arguments[1]);

        fs.writeFileSync("./" + config.components_folder + "/" + usr_arguments[1] + ".vue", file);

        console.log("creation of component sucessful !!! ");
    break;

    case "component":
        var extractcomponent = require('./lib/extractcomponent.js');
        extractcomponent();
    break;

    case "prepare":
        if(!fs.existsSync(execdir + '/component.config.js'))
            (fs.createReadStream(__dirname + '/lib/default.config.js').pipe(fs.createWriteStream(execdir + "/component.config.js")), console.log("config generate, change the configs and run again 'extract prepar' "))
        else {
            var config = require(execdir + '/component.config.js');

            !fs.existsSync(config.components_folder) ? mkdirp.sync(config.components_folder) : null;

            if(!fs.existsSync(config.globalPath))
                mkdirp.sync(config.globalPath);

            if(!fs.existsSync(config.globalPath + "/" + config.build_Script.save_folder))
                mkdirp.sync(config.globalPath + "/" + config.build_Script.save_folder);

            fs.createReadStream(__dirname + '/lib/files_use/vue.min.js').pipe(fs.createWriteStream(config.globalPath + "/" + config.build_Script.save_folder + '/vue.min.js'));
            fs.createReadStream(__dirname + '/lib/files_use/vue-router.min.js').pipe(fs.createWriteStream(config.globalPath + "/" + config.build_Script.save_folder + '/vue-router.min.js'));

            if(!fs.existsSync(config.globalPath + "/" + config.build_stylesheet.save_folder))
                mkdirp.sync(config.globalPath + "/" + config.build_stylesheet.save_folder);

            fs.createReadStream(__dirname + '/lib/files_use/materialize.min.css').pipe(fs.createWriteStream(config.globalPath + "/" + config.build_stylesheet.save_folder + '/materialize.min.css'));
            fs.createReadStream(__dirname + '/lib/files_use/fonts.zip').pipe(unzip.Extract({ path: config.globalPath }));

            fs.readFile(__dirname + "/lib/files_use/index.html", 'utf8', (err, data) =>{
                if(err)
                    throw err;
                var file = data.replace(/{name_script}/gi, config.build_Script.min).replace(/{name_style}/gi, config.build_stylesheet.name);
                fs.writeFileSync(execdir + "/index.html", file);

            });

            !fs.existsSync(execdir + "/" + config.file_nameToRender) ? fs.writeFileSync(execdir + "/" + config.file_nameToRender, '//@generate with extractcomponent') : null;


        }
    break;

    default:
        console.log("command inválid");
}
