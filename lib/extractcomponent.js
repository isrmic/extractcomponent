var extract = function () {

  var fs = require('fs');
  var execdir = process.cwd();
  var config;

  if(fs.existsSync(execdir + '/component.config.js'))
      config = require(execdir + '/component.config.js');
  else
      config = require("./default.config.js");

  var mainjsExists = fs.existsSync(config.file_nameToRender);

  function minify () {

      var uglify = require("uglify-js");
      var uglified = uglify.minify([config.build_Script.save_folder + config.build_Script.name]);
      fs.writeFileSync(config.build_Script.save_folder + config.build_Script.min, uglified.code);

  }

  async function run (){

      var src_file;
      var _template;
      var _script;
      var _style;
      var _allStyle = '';
      var component;
      var components = [];
      var component_name;


      if(!mainjsExists)
          (console.log(`file ${config.file_nameToRender} is inexistent !! `), process.exit())

      var final_file = fs.readFileSync(config.file_nameToRender, 'utf8');

      if(!fs.existsSync('./'+config.components_folder))
          fs.mkdir('./'+config.components_folder);

      fs.readdir("./"+config.components_folder, (err, files) => {

          if(err)
              throw err;

          files.forEach(file => {

              src_file = fs.readFileSync("./"+config.components_folder + "/" + file, 'utf8');

              src_file.replace(/<template>([^\n]*\n+)+<\/template>/gi, (x, y) => {

                  _template = '<div>' + x.replace(/\n/g, '   ').replace(/\s{4}/g, '').replace(/<template>|<\/template>/gi, "") + '</div>';
              });

              _script = '';
              src_file.replace(/<script>([^\n]*\n+)+<\/script>/gi, (x, y) => {

                  _script = x.replace(/<script>|<\/script>/gi, "");
              });

              component_name = '';
              src_file.replace(/<name>(.*?)<\/name>/i, (x, y) => {
                  component_name = y;
              });

              _style = '';
              src_file.replace(/<style>([^\n]*\n+)+<\/style>/gi, (x, y) => {
                  _style = x.replace(/<style>|<\/style>/gi, "").replace(/\n/g, '').replace(/\s{4}/g, '');
              });

              _allStyle += _style !== undefined ? _style : '';

              components[component_name] =
      `{

          template:`+'`'+`${_template}`+'`'+`,
          ${_script}
      }
      `;


          });

          final_file = final_file.replace(/#{(.*?)}/gi, function (x,y) {
              return components[y];
          });

          final_file = final_file.replace(/[^\w|\d|:]?\/\/.+/gi, "//view this comment in original file " + config.file_nameToRender);

          final_file = final_file.replace(/<{(.*?)}\/>/gi, function (x,y){
              return `Vue.component('${y}', ${components[y]});`;
          });

          final_file = final_file.replace(/<{{(.*?)}}>/gi, function (x,y){
              return `${components[y]}`;
          });

          if(!fs.existsSync(config.build_stylesheet.save_folder))
              fs.mkdir(config.build_stylesheet.save_folder);
          if(!fs.existsSync(config.build_Script.save_folder))
              fs.mkdir(config.build_Script.save_folder);

          fs.writeFileSync(config.build_stylesheet.save_folder + config.build_stylesheet.name, _allStyle);
          fs.writeFileSync(config.build_Script.save_folder + config.build_Script.name, final_file);


          fs.writeFileSync(config.build_Script.save_folder + config.build_Script.name, final_file);

          if(config.minify){
              minify();
          }

      });
    }

    run().then(() => {
        console.log("\x1b[1m");
        console.log("\x1b[32m", "extraction finish with sucessfull !!");
        console.log("\x1b[37m");

    });

    if(config.watch && mainjsExists){

        fs.watch('./'+config.file_nameToRender, (evType, filename) => {
            if("change" === evType)
            run().then(() => {
                console.log("\x1b[1m");
                console.log("\x1b[32m", "extraction finish with sucessfull !!");
                console.log("\x1b[37m");
            });
        });

        fs.watch('./'+config.components_folder, (evType, filename) => {
            if("change" === evType)
            run().then(() => {
                console.log("\x1b[1m");
                console.log("\x1b[32m", "extraction finish with sucessfull !!");
                console.log("\x1b[37m");
            });
        });
    }
}
module.exports = extract;
