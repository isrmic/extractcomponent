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
    rf = rf.replace(/export ((([^function])|(function))[\sa-z]*)/g, (x, y, z) => {

        let prop;
        let value;        

        if(z === "function"){
            prop = y.split(" ")[1];
            value = x.replace("export", "");
        }
        else
            value = prop = y;

        return `exports.${prop} = ${value}`;

    });

    return rf;
}

module.exports = serializeexports;
