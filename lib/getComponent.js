function requirecomponente(files, config){

  // requires
  const path = require('path');
  const fs = require('fs');
  const babel = require('babel-core');
  const cheerio = require('cheerio');
  const pug = require('pug');
  const imports = require('./imports.js');

  // var used for extract component

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
  var ext;
  var type;
  var _id_render_react = '';
  var _components_vue = [];
  var components = {};
  var dirfiles;

  function getTypeComponent (str_file) {

      var type;

      str_file.replace(/<forcomponent\b[^>]*>(.*?)<\/forcomponent>/i, (x, y) => {
          type = y.replace(/\s/gi, "");
      });

      return type;
  }

  function getContextComponent (namefile, ext){

      var source_file = fs.readFileSync("./" + config.components_folder + "/" + namefile, 'utf8');

      if(ext === ".jade" || ext === ".pug")
          source_file = pug.render(source_file,{
            filename:config.components_folder,
            pretty:  true
          });

      return source_file;
  }

  function getNameComponent (str_file) {
      var component_name = '';
      str_file.replace(/<name\b[^>]*>(.*?)<\/name>/i, (x, y) => {
          component_name = y.replace(/\s/gi, "");
      });
      return component_name;
  }

  function getStyleComponent(str_file){
      var _style = '';
      str_file.replace(/<style\b[^>]*>([^\n]*\n+)+<\/style>/gi, (x, y) => {
          _style = x.replace(/<style\b[^>]*>|<\/style>/gi, "").replace(/\n/g, '').replace(/\s{4}/g, '');
      });
      return _style;
  }

  if(files.constructor === String)
      files = [files];

  files.forEach(namefile => {

      ext = path.extname(namefile);

      if(ext === ""){

          dirfiles = fs.readdirSync("./" + config.components_folder);

          dirfiles.map(namefiles =>{
              if(namefile === namefiles.replace(/.[\s]?[\w]+[\s]?$/i, ""))
                  namefile = namefiles;ext = path.extname(namefile);return;
          });
      }

      if(ext === ".vue")
          type = "vue";
      else if(ext === ".react")
          type = "react";
      else if(ext === ".html" || ext === ".jade" || ext === ".pug")
          type = "defined";

      console.log(`extracting ${namefile} component ...`);

      src_file = getContextComponent(namefile, ext);

      if(type === "defined"){
          type = getTypeComponent(src_file);
      }

      $ = cheerio.load('<html>' + src_file + '</html>', {decodeEntities: false, xmlMode: true, withDomLvl1:false});

      if(type === undefined)
          (console.log('type of component is undefined'), process.exit())


      _template = $('html').children('template');
      if(_template.attr('lang') === "jade" || _template.attr('lang') === "pug")
          _template = pug.render(_template);

      if(type === "react")
          _id_render_react = $(_template).attr('id');

      _template = $(_template).html();

      _template = _template !== undefined && _template !== null ? '<div>' + _template.replace(/\n/g, '   ').replace(/\s{4}/g, '') + "</div>" : '';
      _script = '';

      _script = $('html').children('script').html();

      _script = _script == null ? '' : imports(_script, 2, config);


      component_name = getNameComponent(src_file);


      _style = getStyleComponent(src_file);

      _allStyle += _style !== undefined ? _style : '';      

      var _name_component;
      var _body_component;
      var _script_component;
      var _final_component = '';
       _components_vue = [];

      if(type === "vue"){

          var _component_vue = $('html').children('component');

          _component_vue.map((index, element) =>{

              _name_component = $(element).attr('name');
              _body_component = $(element).children('template').html().replace(/\s{1,}/g, ' ');
              _script_component = $(element).children('script').html();
              _components_vue[index] = `Vue.component('${_name_component}', { template:`+'`'+`${_body_component}`+'`'+`, ${_script_component} })`;

          });

          componentsvue[component_name] =`{ template:`+'`'+`${_template}`+'`'+`, ${_script} }`;
          componentsvue[component_name + "subcomponents"] = _components_vue.join("");
          componentsvue[component_name + "type"] = "vue";

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

          if(startdelimiter >=0 && enddelimiter){
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
          componentsreact[component_name + "type"] = "react";
      }
   });

   components.vue = componentsvue;
   components.react = componentsreact;
   components.allStyle = _allStyle;
   return components;
}
module.exports = requirecomponente;
