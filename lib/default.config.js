var config = {

    file_nameToRender:'main.js',

    components_folder:"components",

    build_Script:{
        name:'build.component.js',
        save_folder:'./js/',
        min:'build.components.min.js'
    },

    build_stylesheet:{
        name:'style.component.css',
        save_folder:'./css/'
    },

    watch:false,
    minify:true

}

module.exports = config;
