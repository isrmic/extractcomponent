function serializeexports (_entry, main_var, mod_var) {

    var rf = _entry;

    // var patternexport = /export (default|[a-zA-Z])([^a-zA-Z]+|[\w\s\n]+)([\s\w\n]+[\s=.*+/,:\w'"\n{}()]+)+[;]?$/gim;
    //
    // var res = rf.match(patternexport);
    //
    // rf = rf.replace(patternexport, (x, y) =>{
    //     console.log("replace 1");
    //     let re = x.split(" ");
    //
    //     if(!(/[^a-zA-Z]/gi.test(re[1].replace(";", ""))) && re[1] !== "default"){
    //         return x.replace("export", `module.exports['${re[1].replace(";", "")}'] = `);
    //       return x.replace(x, "");
    //     }
    //     else{
    //         return x.replace("export default", "module.exports = ");
    //     }
    //
    // });

    rf = rf.replace(/export default/g, "module.exports = ");
    // console.log(rf.indexOf("export"), _entry);
    rf = rf.replace(/[^\s\w\-]export ((([^function])|(function|const|var))[\sa-zA-Z=,{}]*[;]?)/g, (x, y, z) => {

        let prop;
        let value;
        let _return;
        // console.log('here', x, y, z)
        if(z === "function" || z === "const" || z === "var"){
            prop = y.split(" ")[1].replace(";", "");
            value = x.replace("export", "");
            if(z === "const" || z === "var"){
                value = value.replace(y, "");
            }
            _return = `\nexports.${prop} = ${value}`;
        }
        else if(z.indexOf("{") === 0){
            value = x.replace("export", "exports =");
            _return = `\n${value}\nmodule.exports = exports;`;
        }
        else{
            value = prop = y.replace(";", "");
            _return = `\nexports.${prop} = ${value}`;
        }

        return _return;

    });

    return rf;
}

module.exports = serializeexports;
