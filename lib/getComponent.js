function requirecomponente(files, config, entrypath){
  // requires
  const path = require('path');
  const fs = require('fs');
  const babel = require('babel-core');
  const cheerio = require('cheerio');
  const pug = require('pug');
  const imports = require('./imports.js');
  const serializeexports = require('./serializeexports.js');

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


  var _path = entrypath || path.join(process.cwd(), config.components_folder);

  var scopdata = /component =>[\s]*[{]{1}(([^\n]*\n+)+)([\s]*[}]{1})/gi;

  function defineTypecomponent(ext){

    if(ext === ".vue")
        type = "vue";
    else if(ext === ".react")
        type = "react";
    else if(ext === ".html" || ext === ".jade" || ext === ".pug" || ext === "")
        type = "defined";

    return type;

  }

  function getTypeComponent (str_file) {

      var type;

      str_file.replace(/<forcomponent\b[^>]*>(.*?)<\/forcomponent>/i, (x, y) => {
          type = y.replace(/\s/gi, "");
      });

      return type;
  }

  function getContextComponent (namefile, ext, _path, objinfo){

      let pathfile = path.join(_path, namefile);

      let pathfileload;

      if(ext === ""){
          let files = fs.readdirSync(pathfile);
          for(let i = 0; i < files.length; i++){

              if("index" === files[i].replace(path.extname(files[i]), "")){
                  pathfileload = path.join(pathfile, files[i]);
                  ext = path.extname(files[i]);
                  break;
              }
          }
          if(pathfileload === undefined)
              return null;

          objinfo.path = pathfileload;

      }
      else
          pathfileload = pathfile;

      let resultcode = fs.readFileSync(pathfileload, 'utf8');

      if(ext === ".jade" || ext === ".pug")
          resultcode = pug.render(source_file,{
            filename:config.components_folder,
            pretty:  true
          });
      else if(ext === ".js" || ext === ".jsx"){
          objinfo.type = "react";
          resultcode = babel.transform(resultcode, { presets:["react"] }).code;
      }
      type = defineTypecomponent(ext);

      objinfo.ext = ext;
      return resultcode;
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
              if(namefile === namefiles.replace(/[.][\s]?[\w]+[\s]?$/i, ""))
                  namefile = namefiles;ext = path.extname(namefile);return;
          });
      }

      type = defineTypecomponent(ext);

      console.log(`extracting ${namefile} component ...`);

      var infos = {path:'', type:'', ext:''};

      src_file = getContextComponent(namefile, ext, _path, infos);

      if(src_file === null)
          return;

      if(infos.path !== '')
          _path = infos.path
      else
          _path = path.join(_path, config.components_folder, namefile);

      if(infos.type !== '')
          type = infos.type;

      else if(type === "defined"){
          type = getTypeComponent(src_file);
      }

      global.typecomponent = type;

      $ = cheerio.load('<html>' + src_file + '</html>', {decodeEntities: false, xmlMode: true, withDomLvl1:false});      

      if(type === undefined || type === "")
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

      let _scope;
      let _imports;

      if(_script !== null){
          _scope = scopdata.exec(_script);

          if(_scope !== null){
            _script = _script.replace(_scope[0], "");
            _scope = _scope[1] !== null ? _scope[1] : '';
          }
      }

      scopdata.exec("");

      global.getComponent = "nonregister";

      if(ext !== "")
          _path = path.dirname(_path);

      _script = _script == null ? '' : imports(_script, 2, config, _path);
      _scope = _scope == null ? '' : imports(_scope, 2, config, _path);

      global.getComponent = null;

      component_name = ext !== "" ? getNameComponent(src_file) : namefile;


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

              let _scope_scomponent;

              _name_component = $(element).attr('name');
              _body_component = ('<div sub>' + $(element).children('template').html() + '</div sub>').replace(/\s{0,}<div sub>/gi, "<div>").replace(/\s+<\/div sub>/gi, "\n</div>");
              // console.log(_body_component)
              if($(element).children('template').attr('lang') === "jade" || $(element).children('template').attr('lang') === "pug"){
                  _body_component = pug.render(_body_component);
              }

              _script_component = $(element).children('script').html();
              _script_component = _script_component === null ? '' : _script_component;

              if(_script_component !== null){
                  _scope_scomponent = scopdata.exec(_script_component);

                  if(_scope_scomponent !== null){
                    _script_component = _script_component.replace(_scope_scomponent[0], "");

                    _scope_scomponent = _scope_scomponent[1] !== null ? _scope_scomponent[1] : '';
                  }
              }

              //restart regex
              scopdata.exec("");
              _components_vue[index] = `(function(){\n${_script_component}\nVue.component('${_name_component}', \n{\ntemplate:`+'`'+`${_body_component}`+'`'+`,\n${_scope_scomponent.replace(/\s{3,}/g, " ")} });\n})();`;

          });

          componentsvue[component_name] =`{ template:`+'`'+`${_template}`+'`'+`, ${_scope} }`;
          _script = _script.replace(/\n{2,}/g, "");

          componentsvue[component_name + "scope1"] = _script;
          // console.log(componentsvue[component_name + "scope1"]);
          componentsvue[component_name + "subcomponents"] = _components_vue.join("\n\n");
          componentsvue[component_name + "type"] = "vue";

      }

      else if(type === "react" && infos.ext !== ".jsx" && infos.ext !== ".js") {

          var _component_react;

          var _components_react = [];

          _component_react = $('html').children('component');

          _component_react.map((index, element) =>{

              let _scope_scomponent;

              _name_component = $(element).attr('name');
              _body_component = ('<div sub>' + $(element).children('template').html() + '</div sub>').replace(/\s{0,}<div sub>/gi, "<div>").replace(/\s+<\/div sub>/gi, "\n</div>");

              if($(element).children('template').attr('lang') === "jade" || $(element).children('template').attr('lang') === "pug")
                  _body_component = pug.render(_body_component);

              _script_component = $(element).children('script').html();
              _script_component = _script_component === null ? '' : _script_component;

              if(_script_component !== null){
                  _scope_scomponent = scopdata.exec(_script_component);

                  if(_scope_scomponent !== null){
                    _script_component = _script_component.replace(_scope_scomponent[0], "");
                    _scope_scomponent = _scope_scomponent[1] !== null ? _scope_scomponent[1] : '';
                  }
              }

              //restart regex matchs
              scopdata.exec("");

              _components_react[index] = `
              function ${_name_component.charAt(0).toUpperCase() + _name_component.slice(1)} (props){
                    ${_scope_scomponent}
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

          _body_component = _template !== "" && _template !== undefined ? `
          class ${component_name} extends React.Component {
              ${_scope}
              render () {
                  return (${_template});
              }
          }` : '';
          _body_component = `\n${_script}\n${_body_component}\n`;
          componentsreact[component_name] = babel.transform(`
          ${_components_react.join("")}
          ${_body_component}
          ${render}
          `, config.babel_compiler.options.react).code;
          componentsreact[component_name + "type"] = "react";
      }
      else if(type === "react" && (infos.ext === ".jsx" || infos.ext === ".js") ){

          src_file = imports(src_file, 2, config, _path);
          src_file = serializeexports(src_file);
          componentsreact[component_name] = src_file;
      }
   });

   global.components.vue = componentsvue;
   global.components.react = componentsreact;
   global.components.allStyle += _allStyle || '';

   return global.components;
}
module.exports = requirecomponente;
