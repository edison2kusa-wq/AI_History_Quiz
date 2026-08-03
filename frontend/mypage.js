// ===========================================
// AI 한국사 마이페이지
// ===========================================


document.addEventListener(
"DOMContentLoaded",
function(){


auth.onAuthStateChanged(

function(user){


if(user){

loadMyPage(user);

}


});


});





async function loadMyPage(user){

loadProfile(user);

// ===========================
// 시험 기록
// ===========================


const historySnap =

await db.collection("users")

.doc(user.uid)

.collection("quizHistory")

.orderBy(
"created",
"asc"
)

.get();



let scores=[];

let total=0;



historySnap.forEach(function(doc){


const data =
doc.data();



scores.push(
data.percent || 0
);



total +=
data.percent || 0;

loadRecommendedQuestions(user);

});



document.getElementById(
"totalExam"
)
.innerText =
historySnap.size;



document.getElementById(
"avgScore"
)
.innerText =

historySnap.size

?

Math.round(
total/historySnap.size
)
+"%"

:

"0%";





drawScoreChart(scores);




// ===========================
// 오답 수
// ===========================


const wrongSnap =

await db.collection("users")

.doc(user.uid)

.collection("wrongAnswers")

.get();



document.getElementById(
"wrongCount"
)
.innerText =
wrongSnap.size;





// ===========================
// 즐겨찾기
// ===========================


const bookSnap =

await db.collection("users")

.doc(user.uid)

.collection("bookmarks")

.get();



document.getElementById(
"bookmarkCount"
)
.innerText =
bookSnap.size;



analyzeWeakArea(wrongSnap);



}




// ===========================================
// 점수 그래프
// ===========================================

function drawScoreChart(data){


const ctx =

document.getElementById(
"scoreChart"
);



new Chart(ctx,{


type:"line",


data:{


labels:
data.map(
(_,i)=>
(i+1)+"회"
),


datasets:[{


label:"정답률",


data:data,


borderColor:"#2563eb",


backgroundColor:
"rgba(37,99,235,0.2)",


tension:0.3



}]


}



});


}





// ===========================================
// 취약 분야 분석
// ===========================================


function analyzeWeakArea(snapshot){


let period={};



snapshot.forEach(function(doc){


const q =
doc.data();


const p =
q.period || "기타";


period[p]=
(period[p]||0)+1;


});



let max="";

let count=0;



Object.keys(period)

.forEach(function(key){


if(period[key]>count){

max=key;

count=period[key];


}


});




document.getElementById(
"weakArea"
)
.innerHTML=


`

<p>

가장 많이 틀린 시대 :

<b>

${max}

</b>

(${count}문제)

</p>

`;





document.getElementById(
"recommendArea"
)
.innerHTML=


`

<p>
🤖 추천 학습 :
${max} 시대 집중 학습 필요
</p>

<p>
오답노트를 다시 풀고,
사료형 문제를 추가 학습하세요.
</p>

`;

}
// ===========================================
// AI 추천 문제
// ===========================================

async function loadRecommendedQuestions(user){


const area =
document.getElementById(
"recommendQuestions"
);



if(!area)return;



try{


// 오답 가져오기

const wrongSnap =

await db.collection("users")

.doc(user.uid)

.collection("wrongAnswers")

.limit(20)

.get();



let weakPeriod={};



wrongSnap.forEach(function(doc){


const q =
doc.data();


const p =
q.period || "기타";


weakPeriod[p] =
(weakPeriod[p]||0)+1;


});



// 가장 약한 시대 찾기

let weak="";

let max=0;



Object.keys(weakPeriod)

.forEach(function(p){


if(weakPeriod[p]>max){

weak=p;

max=weakPeriod[p];

}


});





// 문제 검색

const qSnap =

await db.collection("questions")

.where(
"period",
"==",
weak
)

.limit(5)

.get();



let html="";



qSnap.forEach(function(doc){


const q =
doc.data();



html +=


`

<div class="questionBox">


<h3>

${q.question}

</h3>


<p>

시대 :
${q.period}

</p>


<p>

분야 :
${q.category}

</p>



<button onclick="startRecommend('${doc.id}')">

풀기

</button>


</div>


`;



});



area.innerHTML =

html ||

`

<p>

추천 문제가 없습니다.

</p>

`;



}

catch(e){


console.error(e);


}


}

function startRecommend(id){


location.href =
"quiz.html?recommend="+id;


}
// ===========================================
// AI 학습 수준 분석
// ===========================================


async function analyzeUserLevel(user){


const snap =

await db.collection("users")

.doc(user.uid)

.collection("quizHistory")

.orderBy(
"created",
"desc"
)

.limit(10)

.get();



let total=0;

let count=0;



snap.forEach(function(doc){


const data =
doc.data();


total +=
data.percent || 0;


count++;


});



const avg =

count>0

?

Math.round(
total/count
)

:

0;



let level;



if(avg>=90){


level="최상급";


}

else if(avg>=75){


level="상급";


}

else if(avg>=60){


level="중급";


}

else{


level="기초";


}



return {


score:avg,

level:level


};


}
async function getAdaptiveQuestions(user){


const result =

await analyzeUserLevel(user);



let targetLevel;



if(result.level==="최상급"){

targetLevel="상";


}

else if(result.level==="상급"){

targetLevel="상";


}

else if(result.level==="중급"){

targetLevel="중";


}

else{

targetLevel="중";


}



const snapshot =

await db.collection(
"questions"
)

.where(
"level",
"==",
targetLevel
)

.limit(10)

.get();



let list=[];



snapshot.forEach(function(doc){


let q =
doc.data();


q.id =
doc.id;


list.push(q);



});



return list;


}
async function loadProfile(user){


const doc =

await db.collection("users")

.doc(user.uid)

.get();



if(!doc.exists)return;


const data =
doc.data();



document.getElementById(
"userLevel"
)
.innerText =

data.level ||
"Lv.1 역사 입문자";



document.getElementById(
"userPoint"
)
.innerText =

data.point ||
0;


}