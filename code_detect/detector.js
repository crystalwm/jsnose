var Nose = require('../lib/nose.js');
var nose=new Nose({},
    ['../_smells/css_in_javascript.js',
    '../_smells/long_scope_chaining.js']);

for(var i in nose){
    console.log(i);
}

nose.loadFiles(function(){
    console.log("读取文件完毕！");
});
nose.reporter();
nose.run();
