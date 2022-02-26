import * as req_aaa$2 from 'aaa';
import * as req_bbb$1 from 'bbb';
import * as req_ccc$1 from 'ccc';
import path from 'path';

var qqq=1;
console.log(qqq);
console.log(path);
(function(){
    var aaa=req_aaa$2;
    console.log(aaa);
})();
(function(){
    var bbb=req_bbb$1;
    console.log(bbb);
})();
if(import.meta.env.DEV){
    var req_aaa$1=req_aaa$2;
    console.log(req_aaa$1);
}
if(import.meta.env.PROD){
    var ccc=req_ccc$1;
    console.log(ccc);
}
