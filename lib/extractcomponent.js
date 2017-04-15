var extract = function () {

  var fs = require('fs');
  var path = require('path');
  var babel = require('babel-core');
  var mkdirp = require('mkdirp');

  var execdir = process.cwd();
  var config;

  if(fs.existsSync(execdir + '/component.config.js'))
      config = require(execdir + '/component.config.js');
  else
      config = require("./default.config.js");

  function minify () {

      console.log('Minifying file ...');

      var uglify = require("uglify-js");
      var uglified = uglify.minify([config.build_Script.save_folder + config.build_Script.name]);
      fs.writeFileSync(config.globalPath + "/" + config.build_Script.save_folder + config.build_Script.min, uglified.code);

      console.log(`Minifying finish`);

  }

  function minify_babel (code) {

      console.log('Minifying file');

      var code_babel = babel.transform(code, {presets:["babili"]}).code;
      fs.writeFileSync(config.globalPath + "/" + config.build_Script.save_folder + config.build_Script.min, code_babel);

      console.log(`Minifying finish`);
  }
  function onFinish (){
      console.log("\x1b[1m");
      console.log("\x1b[32m", "extraction finish with sucessfull !!!");
      console.log("\x1b[37m");
  }

  function run (){

      console.log('extraction of components start ...');

      var src_file;
      var _template;
      var _script;
      var _style;
      var _allStyle = '';
      var component;
      var componentsvue = [];
      var componentsreact = [];
      var component_name;

      var final_file = '';
      var part_files;
      var files_render = [];
      var filesexists;

      if(config.file_nameToRender.constructor === String)
          files_render.push(config.file_nameToRender);
      else if(config.file_nameToRender.constructor === Array)
          files_render = config.file_nameToRender;

      files_render.map(file =>{

          filesexists = fs.existsSync(file);

          if(!filesexists)
              (console.log(`file ${file} is inexistent !! `), process.exit())
      });


      if(!fs.existsSync('./'+config.components_folder))
          mkdirp.sync('./'+config.components_folder);

      fs.readdir("./"+config.components_folder, (err, files) => {


          console.log('read components ...');

          if(err)
              throw err;
          var ext;
          var type;
          files.forEach(file => {

              ext = path.extname(file);
              if(ext === ".vue")
                  type = "vue";
              else if(ext === ".react")
                  type = "react";
              else if(ext === ".html")
                  type = "defined";

              console.log(`extracting ${file} component ...`);

              src_file = fs.readFileSync("./" + config.components_folder + "/" + file, 'utf8');

              if(type === "defined"){
                  src_file.replace(/<forcomponent\b[^>]*>(.*?)<\/forcomponent>/i, (x, y) => {
                      type = y;
                  });
              }

              if(type === undefined)
                  (console.log('type of component is undefined'), process.exit())

              src_file.replace(/<template\b[^>]*>([^\n]*\n+)+<\/template>/gi, (x, y) => {

                  _template = '<div>' + x.replace(/\n/g, '   ').replace(/\s{4}/g, '').replace(/<template\b[^>]*>|<\/template>/gi, "") + '</div>';
              });

              _script = '';
              src_file.replace(/<script\b[^>]*>([^\n]*\n+)+<\/script>/gi, (x, y) => {

                  _script = x.replace(/<script\b[^>]*>|<\/script>/gi, "");
              });

              component_name = '';
              src_file.replace(/<name\b[^>]*>(.*?)<\/name>/i, (x, y) => {
                  component_name = y;
              });

              _style = '';
              src_file.replace(/<style\b[^>]*>([^\n]*\n+)+<\/style>/gi, (x, y) => {
                  _style = x.replace(/<style\b[^>]*>|<\/style>/gi, "").replace(/\n/g, '').replace(/\s{4}/g, '');
              });

              _allStyle += _style !== undefined ? _style : '';
              if(type === "vue"){
                  componentsvue[component_name] =`{ template:`+'`'+`${_template}`+'`'+`, ${_script} }`;
              }

              else if(type === "react") {

                  render = '';
                  src_file.replace(/<render\b[^>]*>([^\n]*\n+)+<\/render>/i, (x, y) => {
                      render = x.replace(/<render\b[^>]*>|<\/render>/gi, "");
                  });

                  componentsreact[component_name] = babel.transform(`
                  class ${component_name} extends React.Component {
                      ${_script}
                      render () {
                          return (${_template});
                      }
                  }
                  ${render}
                  `, config.babel_compiler.options.react).code;
              }

          });

          files_render.map(file =>{

              part_files = fs.readFileSync(file, 'utf8');

              part_files = part_files.replace(/#{(.*?)}/gi, function (x,y) {
                  if(components[y] !== undefined){
                      return components[y];
                  }
              });

              //final_file = final_file.replace(/[^\w|\d|:]?\/\/.+/gi, "//view this comment in original file " + config.file_nameToRender);

              part_files = part_files.replace(/<{(.*?)}\/>/gi, function (x,y){
                  if(componentsvue[y] !== undefined)
                      return config.babel_compiler.options.vue.lenth > 0 ?
                          babel.transform(`Vue.component('${y}', ${componentsvue[y]});`, config.babel_compiler.options.vue).code :
                          `Vue.component('${y}', ${componentsvue[y]});`;
                  else if(componentsreact[y] !== undefined)
                      return componentsreact[y];
                  else
                      return x;
              });

              // console.log(final_file)

              part_files = part_files.replace(/<{{(.*?)}}>/gi, function (x,y){
                    if(componentsvue[y] !== undefined)
                        return `{${componentvue[y]}}`;
                    else
                        return x;
              });

              final_file += part_files;

          });


          if(!fs.existsSync(config.globalPath + "/" + config.build_stylesheet.save_folder))
              mkdirp.sync(config.globalPath + "/" + config.build_stylesheet.save_folder);
          if(!fs.existsSync(config.globalPath + "/" + config.build_Script.save_folder))
              mkdirp.sync(config.globalPath + "/" + config.build_Script.save_folder);

          fs.writeFileSync(config.globalPath + "/" + config.build_stylesheet.save_folder + config.build_stylesheet.name, _allStyle);

          if(config.babel_compiler.use && Object.keys(config.babel_compiler.options.final_compiler).length > 0){

              console.log('start compiler for es2015 ...');

              final_file = babel.transform(final_file, config.babel_compiler.final_compiler).code;

              console.log('finish compiler for es2015 ...');

              if(config.babel_compiler.minify)
                  minify_babel(final_file);
          }

          fs.writeFileSync(config.globalPath + "/" + config.build_Script.save_folder + config.build_Script.name, final_file);
          console.log(`exporting ${config.build_Script.name} ...`);
          onFinish();

          if(config.minify){
              minify();
          }

      });
    }

    run();

    if(config.watch && mainjsExists){

        fs.watch('./'+config.file_nameToRender, (evType, filename) => {
            if("change" === evType)
            run();
        });

        fs.watch('./'+config.components_folder, (evType, filename) => {
            if("change" === evType)
            run();
        });
    }
}
module.exports = extract;
