const CACHE_NAME =
"ai-history-v1";


const files = [

"index.html",

"quiz.html",

"style.css",

"quiz.js",

"firebase-config.js"

];



// 설치

self.addEventListener(
"install",
event=>{


event.waitUntil(

caches.open(
CACHE_NAME
)

.then(cache=>{

return cache.addAll(files);

})

);


});




// 실행

self.addEventListener(
"fetch",
event=>{


event.respondWith(


caches.match(
event.request
)

.then(response=>{


return response ||

fetch(
event.request
);


})


);


});