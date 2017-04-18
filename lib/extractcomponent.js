var extract = function () {

  var fs = require('fs');
  var path = require('path');
  var babel = require('babel-core');
  var mkdirp = require('mkdirp');
  var pug = require('pug');

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
      var _scoperender;
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
          var _id_render_react = '';
          var _components_vue = [];

          const cheerio = require('cheerio');

          files.forEach(file => {

              ext = path.extname(file);
              if(ext === ".vue")
                  type = "vue";
              else if(ext === ".react")
                  type = "react";
              else if(ext === ".html" || ext === ".jade")
                  type = "defined";

              console.log(`extracting ${file} component ...`);

              src_file = fs.readFileSync("./" + config.components_folder + "/" + file, 'utf8');

              if(ext === ".jade")
                  src_file = pug.render(src_file);

              if(type === "defined"){
                  src_file.replace(/<forcomponent\b[^>]*>(.*?)<\/forcomponent>/i, (x, y) => {
                      type = y;
                  });
              }

              $ = cheerio.load('<html>' + src_file + '</html>', {decodeEntities: false, xmlMode: true, withDomLvl1:false});

              if(type === undefined)
                  (console.log('type of component is undefined'), process.exit())

              // src_file.replace(/<template\b[^>]*>([^\n]*\n+)+<\/template>/gi, (x, y) => {
              //
              //     _template = '<div>' + x.replace(/\n/g, '   ').replace(/\s{4}/g, '').replace(/<template\b[^>]*>|<\/template>/gi, "") + '</div>';
              // });

              _template = $('html').children('template');
              if(_template.attr('lang') === "jade")
                  _template = pug.render(_template);

              if(type === "react")
                  _id_render_react = $(_template).attr('id');

              _template = $(_template).html();

              _template = _template !== undefined && _template !== null ? '<div>' + _template.replace(/\n/g, '   ').replace(/\s{4}/g, '') + "</div>" : '';
              _script = '';

              _script = $('html').children('script').html();

              // src_file.replace(/<script\b[^>]*>([^\n]*\n+)+<\/script>/gi, (x, y) => {
              //
              //     var $ = cheerio.load(x);
              //
              //     _components_react = $('script[components]').html();
              //     _script = x.replace(/<script\b[^>]*>|<\/script>/gi, "");
              //
              // });


              _script = _script == null ? '' : _script;
              // _components_react = _components_react == null ? '' : _components_react;

              component_name = '';
              src_file.replace(/<name\b[^>]*>(.*?)<\/name>/i, (x, y) => {
                  component_name = y.replace(/\s/gi, "");
              });


              _style = '';
              src_file.replace(/<style\b[^>]*>([^\n]*\n+)+<\/style>/gi, (x, y) => {
                  _style = x.replace(/<style\b[^>]*>|<\/style>/gi, "").replace(/\n/g, '').replace(/\s{4}/g, '');
              });

              _allStyle += _style !== undefined ? _style : '';

              var _name_component;
              var _body_component;
              var _script_component;
              var _final_component = '';

              if(type === "vue"){

                  var _component_vue = $('html').children('component');

                  _component_vue.map((index, element) =>{

                      _name_component = $(element).attr('name');
                      _body_component = $(element).children('template').html().replace(/\s{1,}/g, ' ');
                      _script_component = $(element).children('script').html();
                      _components_vue[index] = `Vue.component('${_name_component}', { template:`+'`'+`${_body_component}`+'`'+`, ${_script_component} })`;
                  });
                  componentsvue[component_name] =`{ template:`+'`'+`${_template}`+'`'+`, ${_script} }`;
              }

              else if(type === "react") {

                  var _component_react;

                  var _components_react = [];

                  _component_react = $('html').children('component');

                  _component_react.map((index, element) =>{

                      _name_component = $(element).attr('name');
                      _body_component = $(element).children('template').html();

                      _script_component = $(element).children('script').html();

                      _components_react[index] = `
                      function ${_name_component.charAt(0).toUpperCase() + _name_component.slice(1)} (props){
                            ${_script_component}
                            return(
                                ${_body_component}
                            );
                      }
                      `;
                      // console.log(_components_react[index]);
                  });

                  render = '';

                  if(_id_render_react !== undefined && _id_render_react !== ''){
                      render = `
                          ReactDOM.render(
                              <${component_name} />,
                              document.getElementById('${_id_render_react}')
                          );
                      `;
                  }

                  else {
                      src_file.replace(/<render\b[^>]*>([^\n]*\n+)+<\/render>/i, (x, y) => {
                          render = x.replace(/<render\b[^>]*>|<\/render>/gi, "");
                      });
                  }
                  if(render === undefined || render === null)
                      render = '';

                  var startdelimiter = _script.indexOf("{{");
                  var enddelimiter = _script.indexOf("}}");

                  if(true){
                      _scoperender = _script.substring(startdelimiter, enddelimiter);
                      _script = _script.replace(_scoperender, "");
                      _scoperender = _scoperender.replace(/{{|}}/gi, "").replace(/[\n]*/gi, "");
                  }

                  _body_component = _template !== "" && _template !== undefined ? `
                  class ${component_name} extends React.Component {
                      ${_script}
                      render () {
                          ${_scoperender}
                          return (${_template});
                      }
                  }` : '';

                  componentsreact[component_name] = babel.transform(`
                  ${_components_react.join("")}
                  ${_body_component}
                  ${render}
                  `, config.babel_compiler.options.react).code;
                  // console.log(componentsreact[component_name]);
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

                  if(componentsvue[y] !== undefined){
                      var component_final = _components_vue.join("");
                      return config.babel_compiler.options.vue.lenth > 0 ?
                          babel.transform(`Vue.component('${y}',
                          ${componentsvue[y]});
                          ${component_final}`, config.babel_compiler.options.vue).code :
                          `Vue.component('${y}',
                          ${componentsvue[y]});
                          ${component_final}`;
                  }

                  else if(componentsreact[y] !== undefined)
                      return componentsreact[y];
                  else
                      return x;
              });

              // console.log(final_file)

              part_files = part_files.replace(/<{{(.*?)}}>/gi, function (x,y){
                    if(componentsvue[y] !== undefined)
                        return `${componentsvue[y]}`;
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

          if(config.babel_compiler.use){

              if(Object.keys(config.babel_compiler.options.final_compiler).length > 0){

                  console.log('start compiler for es2015 ...');

                  final_file = babel.transform(final_file, config.babel_compiler.options.final_compiler).code;

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
