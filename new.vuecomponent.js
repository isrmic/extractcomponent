#!/usr/bin/env node

var usr_arguments = process.argv.slice(2);
var execdir = process.cwd();

switch(usr_arguments[0]){

    case "newcomponent":
        var fs = require('fs');

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

    case "render":
        var extractcomponent = require('extractcomponent');
        extractcomponent();
    break;

    default:
        console.log("command inválid");
}
