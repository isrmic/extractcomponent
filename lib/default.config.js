var config = {


    globalPath:"./www",

    file_nameToRender:'main.js',

    components_folder:"components",

    build_Script:{
        name:'build.components.js',
        min:'build.components.min.js',
        save_folder:'js/'
    },

    build_stylesheet:{
        name:'style.component.css',
        save_folder:'css/'
    },

    babel_compiler:{

        use:true,
        minify:false,
        options:{
            vue:{
                presets:[
                    "es2015"
                ]
            },
            react:{
                presets:[
                    "react",
                    "es2015"
                ]
            },
            final_compiler:{
                // presets:[
                //     "es2015"
                // ]
            }
        },
    },

    watch:false,

}

module.exports = config;
