var extract = function (__file_to_Extract, _config) {

  var fs = require('fs');
  var path = require('path');
  var babel = require('babel-core');
  var mkdirp = require('mkdirp');
  var imports = require('./imports.js');



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

  var requirecomponente = require('./getComponent.js');

  if(__file_to_Extract !== undefined)
      return requirecomponente(__file_to_Extract, config);

  function run (){

      console.log('extraction of components start ...');

      var componentsvue = [];
      var componentsreact = [];
      var AllComponents = {};


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
          var _id_render_react = '';
          var _components_vue = [];


          AllComponents = requirecomponente(files, config);

          // console.log(AllComponents);
          // process.exit();

          files_render.map(file =>{

              var basename = path.basename(file);
              part_files = fs.readFileSync(file, 'utf8');
              part_files = `(function(module, exports){\nmodule.exports = exports;\n${part_files}\n}).apply(this, [{}, {}])`;
              part_files = imports(part_files, 2, config);

              var filesfc = config.babel_compiler.options.final_compiler.files;


              part_files = part_files.replace(/#{(.*?)}/gi, function (x,y) {
                  if(components[y] !== undefined){
                      return components[y];
                  }
              });


              part_files = part_files.replace(/<{(.*?)}\/>/gi, function (x,y){
                  y = y.replace(/\s/gi, "");

                  if(AllComponents.vue[y] !== undefined){

                      return config.babel_compiler.options.vue.lenth > 0 ?
                          babel.transform(`(function(){${componentsvue[y + "scope1"]}\nVue.component('${y}',${AllComponents.vue[y]})})();

                          ${AllComponents.vue[y + "subcomponents"] === undefined ? '' : AllComponents.vue[y + "subcomponents"]}`, config.babel_compiler.options.vue).code :

                          `(function(){${AllComponents.vue[y + "scope1"]}\nVue.component('${y}',${AllComponents.vue[y]})})();
                          ${AllComponents.vue[y + "subcomponents"] === undefined ? '' : AllComponents.vue[y + "subcomponents"]}`;
                  }

                  else if(AllComponents.react[y] !== undefined)
                      return AllComponents.react[y];
                  else
                      return x;
              });

              // console.log(final_file)

              part_files = part_files.replace(/<{{(.*?)}}>/gi, function (x,y) {
                    if(AllComponents.vue[y] !== undefined)
                        return `${AllComponents.vue[y]}`;
                    else
                        return x;
              });

              filesfc !== undefined && filesfc[basename] !== undefined ? part_files = babel.transform(part_files, {presets:["react"], compact:false}).code : null;

              final_file += part_files;

          });


          if(!fs.existsSync(config.globalPath + "/" + config.build_stylesheet.save_folder))
              mkdirp.sync(config.globalPath + "/" + config.build_stylesheet.save_folder);
          if(!fs.existsSync(config.globalPath + "/" + config.build_Script.save_folder))
              mkdirp.sync(config.globalPath + "/" + config.build_Script.save_folder);

          fs.writeFileSync(config.globalPath + "/" + config.build_stylesheet.save_folder + config.build_stylesheet.name, AllComponents.allStyle);

          final_file = imports(final_file, 2, config);

          if(config.babel_compiler.use){

              if(config.babel_compiler.options.final_compiler.presets !== undefined){

                  console.log('start compiler for es2015 ...');

                  final_file = babel.transform(final_file, {presets:[config.babel_compiler.options.final_compiler.presets]}).code;

                  console.log('finish compiler for es2015 ...');
              }

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

    // if(config.watch && mainjsExists){
    //
    //     fs.watch('./'+config.file_nameToRender, (evType, filename) => {
    //         if("change" === evType)
    //         run();
    //     });
    //
    //     fs.watch('./'+config.components_folder, (evType, filename) => {
    //         if("change" === evType)
    //         run();
    //     });
    // }
}
module.exports = extract;
