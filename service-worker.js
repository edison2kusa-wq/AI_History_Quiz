const CACHE_NAME = "ai-history-v1";


self.addEventListener(
"install",
function(event){

    console.log(
        "Service Worker 설치"
    );

});


self.addEventListener(
"activate",
function(event){

    console.log(
        "Service Worker 활성화"
    );

});


self.addEventListener(
"fetch",
function(event){

});