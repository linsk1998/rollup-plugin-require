import path from "path"
var qqq=1;
console.log(qqq);
console.log(path);
(function(){
    var aaa=require("aaa");
    console.log(aaa);
})();
(function(){
    var bbb=require("bbb");
    console.log(bbb);
})();
if(import.meta.env.DEV){
    var req_aaa$1=require("aaa");
    console.log(req_aaa$1);
}
if(import.meta.env.PROD){
    var ccc=require("ccc");
    console.log(ccc);
}