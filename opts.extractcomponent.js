#!/usr/bin/env node

var fs = require('fs');
var mkdirp = require('mkdirp');
var unzip = require('unzip');

var usr_arguments_cli = process.argv.slice(2);
var execdir = process.cwd();

(function () {

    let command = usr_arguments_cli[0];


    if(command === "new" || command === "-n")
        newComponent(usr_arguments_cli);
    else if(command === "prepare" || command === "init" || command === "-p")
        prepare();
    else if(command === "extract" || command === "-e")
        extract();
    else if(command === "server" || command === "-S" || command === "-s")
        server(usr_arguments_cli.slice(1));
    else if(command === "compact" || command === "-c")
        funccompdec("compact", usr_arguments_cli.slice(1));
    else if(command === "descompact" || command === "-d")
        funccompdec("descompact", usr_arguments_cli.slice(1));

})();

function newComponent (usr_arguments) {

  if(usr_arguments[1] === undefined)
      (console.log('empty arguments for component'), process.exit())
  var capturevalues = usr_arguments[1].split(":");

  var typecomponent = capturevalues[0];
  var namecomponent = capturevalues[1];

  if(namecomponent === undefined)
      (console.log('name component is undefined '),process.exit())

  var extension;
  var componentload;
  if(typecomponent === "jade" || typecomponent === "pug")
      (extension = "." + typecomponent, componentload = __dirname + "/lib/.default_componentpugjade")
  else if(typecomponent === "blank")
      (extension = ".html", componentload = __dirname + `/lib/.default_component`)
  else
      if(typecomponent === "react" || typecomponent === "vue")
          (extension = `.${typecomponent}`, componentload = __dirname + `/lib/.default_component${typecomponent}`)
  else
      (console.log('Unrecognized component type'), process.exit())

  var config;

  if(fs.existsSync(execdir + '/component.config.js'))
      config = require(execdir + '/component.config.js');
  else
      config = require("./lib/default.config.js");

  var file = componentload === 'blank' ? '' : fs.readFileSync(componentload, 'utf8');

  if(fs.existsSync("./" + config.components_folder + "/" + namecomponent + extension))
      throw new Error('this component file already exist');

  file = file.replace(/{{name}}/i, namecomponent);

  fs.writeFileSync("./" + config.components_folder + "/" + namecomponent + extension, file);

  console.log("prepare component sucessful !!! ");
}

function extract () {

    var extractcomponent = require('./lib/extractcomponent.js');
    extractcomponent();

}

function prepare () {

    if(!fs.existsSync(execdir + '/component.config.js'))
        (fs.createReadStream(__dirname + '/lib/default.config.js').pipe(fs.createWriteStream(execdir + "/component.config.js")), console.log("config generate, change the configs and run again 'component prepare' "))
    else {
        var config = require(execdir + '/component.config.js');

        !fs.existsSync(config.components_folder) ? mkdirp.sync(config.components_folder) : null;

        if(!fs.existsSync(config.globalPath))
            mkdirp.sync(config.globalPath);

        if(!fs.existsSync(config.globalPath + "/" + config.build_Script.save_folder))
            mkdirp.sync(config.globalPath + "/" + config.build_Script.save_folder);

        // fs.createReadStream(__dirname + '/lib/files_use/vue.min.js').pipe(fs.createWriteStream(config.globalPath + "/" + config.build_Script.save_folder + '/vue.min.js'));
        // fs.createReadStream(__dirname + '/lib/files_use/vue-router.min.js').pipe(fs.createWriteStream(config.globalPath + "/" + config.build_Script.save_folder + '/vue-router.min.js'));

        if(!fs.existsSync(config.globalPath + "/" + config.build_stylesheet.save_folder))
            mkdirp.sync(config.globalPath + "/" + config.build_stylesheet.save_folder);

        // fs.createReadStream(__dirname + '/lib/files_use/materialize.min.css').pipe(fs.createWriteStream(config.globalPath + "/" + config.build_stylesheet.save_folder + '/materialize.min.css'));
        // fs.createReadStream(__dirname + '/lib/files_use/fonts.zip').pipe(unzip.Extract({ path: config.globalPath }));

        fs.readFile(__dirname + "/lib/files_use/index.html", 'utf8', (err, data) =>{
            if(err)
                throw err;
            var file = data.replace(/{name_script}/gi, config.build_Script.name).replace(/{name_style}/gi, config.build_stylesheet.name);
            fs.writeFileSync(config.globalPath + "/index.html", file);

        });

        !fs.existsSync(execdir + "/" + config.entry) ? fs.writeFileSync(execdir + "/" + config.entry, '//@generate with extractcomponent') : null;
    }
}

function funccompdec (type, args) {

    let compact = require('./lib/compact.js');

    if(type === "compact")
        compact.compact(args);

    else if(type === "descompact"){

        if(args.length >= 2)
            compact.descompact(args);
        else
            console.log('empty args or not passed all args');
    }
}

function server (args) {

    let port = args[0];

    var startserver = require('./lib/server.js');
    startserver(port);
}
