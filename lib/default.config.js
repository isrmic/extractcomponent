var config = {


    globalPath:"./www",

    entry:'main.js',

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
    
    NODE_ENV:'development',

    babel_compiler:{

        use:true,
        minify:false,
        options:{
            vue:{
                presets:[
                    "es2015"
                ],
                compact:false
            },
            react:{
                presets:[
                    "react"
                ],
                compact:false
            },
            final_compiler:{
                // files:{
                //     'main.js':["react"]
                // }
                // presets:[
                //     "es2015"
                // ]
            }
        },
    },

    watch:false,

}

module.exports = config;
