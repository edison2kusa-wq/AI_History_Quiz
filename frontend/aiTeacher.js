async function analyzeStudent(){


const user =
auth.currentUser;


if(!user)return;



const snapshot =

await db.collection("users")

.doc(user.uid)

.collection("quizHistory")

.orderBy(
"created",
"desc"
)

.limit(10)

.get();



let result={};



snapshot.forEach(function(doc){


const q =
doc.data();


if(q.period){


result[q.period] =
(result[q.period]||0)
+
(100-q.percent);


}


});



let weak =
Object.keys(result)
.sort(
(a,b)=>result[b]-result[a]
)[0];



return weak;


}
async function recommendStudy(){


const weak =
await analyzeStudent();



let message="";


switch(weak){


case "조선":

message =
"조선 정치사와 붕당정치를 집중 학습하세요.";

break;



case "고려":

message =
"고려 왕권 강화와 대외 관계를 복습하세요.";

break;



case "일제강점기":

message =
"독립운동 흐름과 주요 인물을 정리하세요.";

break;



default:

message =
"전체 시대 복습을 추천합니다.";

}



return message;


}
async function showTeacherAdvice(){


const advice =
await recommendStudy();



document.getElementById(
"reportBox"
)
.innerHTML +=


`

<div class="questionBox">

<h3>
🤖 AI 한국사 선생님 조언
</h3>


<p>
${advice}
</p>


<p>
다음 목표:
취약 영역 20문제 집중 학습
</p>


</div>

`;

}