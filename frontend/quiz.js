// ===========================================
// AI 한국사 심화 퀴즈
// quiz.js
// ===========================================

// ----------------------------
// 전역 변수
// ----------------------------

let quizList = [];
let currentQuestion = 0;
let score = 0;

let wrongAnswers = [];
let userAnswers = [];

let answered = false;

let timer = null;
let timeLeft = 0;
let examSeconds = 600;


const MOCK_PATTERN = {

    "선사":5,

    "고대":10,

    "고려":8,

    "조선":15,

    "개항기":5,

    "일제강점기":5,

    "현대":2

};

// ----------------------------
// 초기화
// ----------------------------

function $(id){

    return document.getElementById(id);

}


function initQuiz() {

    if ($("startBtn"))
        $("startBtn").onclick = openSettingMenu;

    if ($("settingStartBtn"))
        $("settingStartBtn").onclick = startExam;

    if ($("nextBtn"))
        $("nextBtn").onclick = nextQuestion;

    if ($("prevBtn"))
        $("prevBtn").onclick = previousQuestion;

    if ($("submitBtn"))
        $("submitBtn").onclick = submitExam;

}

// ----------------------------
// 시험 설정창
// ----------------------------

function openSettingMenu() {

    show("settingMenu");

}

// ----------------------------
// 시험 시작
// ----------------------------

async function startExam() {

    const period =
        $("periodSelect").value;

    const category =
        $("categorySelect").value;

    const level =
        $("levelSelect").value;

    const count =
        Number($("countSelect").value);

    quizList =
        await loadQuestions(
            period,
            category,
            level,
            count
        );

    if (quizList.length === 0) {

        alert("문제가 없습니다.");

        return;

    }

    currentQuestion = 0;

    score = 0;

    wrongAnswers = [];

    userAnswers =
        new Array(quizList.length)
        .fill(null);

    answered = false;

    examSeconds = count * 60;

    timeLeft = examSeconds;

    hide("mainMenu");

    show("quizScreen");

    buildQuestionNav();

    startTimer();

    showQuestion();

}

// ----------------------------
// 문제 불러오기
// ----------------------------

async function loadQuestions(
    period,
    category,
    level,
    count
) {

    let list = [];

    const snapshot =
        await db.collection("questions").get();

    snapshot.forEach(function(doc){

        const q = doc.data();

        q.id = doc.id;

        list.push(q);

    });

    if (period !== "전체") {

        list = list.filter(function(q){

            return q.period === period;

        });

    }

    if (category !== "전체") {

        list = list.filter(function(q){

            return q.category === category;

        });

    }

    if (level !== "전체") {

        list = list.filter(function(q){

            return q.level === level;

        });

    }

    shuffle(list);

    return list.slice(0, count);

}

// ----------------------------
// 문제 번호
// ----------------------------

function buildQuestionNav(){

    let html = "";

    for(let i=0;i<quizList.length;i++){

        html +=

        `<button
            onclick="moveQuestion(${i})"
            id="nav${i}"
        >

        ${i+1}

        </button>`;

    }

    $("questionNav").innerHTML = html;

}

// ===========================================
// 문제 표시
// ===========================================

function showQuestion() {

    answered = false;

    const q = quizList[currentQuestion];

    // 진행상황
    $("progress").innerHTML =
        `
        <div id="timer">
        ⏰ 남은시간 : ${secondToText(timeLeft)}
        </div>

        문제 ${currentQuestion + 1} / ${quizList.length}
        `;

    // 진행률
    const percent =
        ((currentQuestion + 1) / quizList.length) * 100;

    $("progressBar").style.width =
        percent + "%";

    // 문제
    $("question").innerHTML =
        q.question;

    // 이미지
    const img =
        $("questionImage");

    if (q.image && q.image !== "") {

        img.src = q.image;

        img.style.display = "block";

    } else {

        img.style.display = "none";

    }

    // 보기
    let html = "";

    q.choices.forEach(function(choice, index){

        html +=

        `
        <button
            class="choiceBtn"
            onclick="checkAnswer(${index})"
            id="choice${index}"
        >

            ${index+1}. ${choice}

        </button>
        `;

    });

    $("choices").innerHTML = html;

    $("result").innerHTML = "";

    hide("nextBtn");

    hide("submitBtn");

    if(currentQuestion==0){

        hide("prevBtn");

    }else{

        show("prevBtn");

    }

    updateQuestionNav();

}

// ===========================================
// 번호판 색상
// ===========================================

function updateQuestionNav(){

    for(let i=0;i<quizList.length;i++){

        const btn =
            $("nav"+i);

        if(!btn) continue;

        btn.style.background = "#ffffff";

        if(userAnswers[i]!==null){

            btn.style.background =
                "#90caf9";

        }

        if(i===currentQuestion){

            btn.style.background =
                "#4CAF50";

            btn.style.color =
                "#ffffff";

        }

    }

}

// ===========================================
// 번호 이동
// ===========================================

function moveQuestion(index){

    currentQuestion = index;

    showQuestion();

}

// ===========================================
// 이전 문제
// ===========================================

function previousQuestion(){

    if(currentQuestion>0){

        currentQuestion--;

        showQuestion();

    }

}

// ===========================================
// 다음 문제
// ===========================================

function nextQuestion(){

    if(currentQuestion < quizList.length-1){

        currentQuestion++;

        showQuestion();

    }else{

        show("submitBtn");

    }

}
// ===========================================
// 정답 확인
// ===========================================

async function checkAnswer(selected){

    if(answered) return;

    answered = true;

    const q = quizList[currentQuestion];

    userAnswers[currentQuestion] = selected;

    const buttons =
        document.querySelectorAll(".choiceBtn");

    buttons.forEach(function(btn){

        btn.disabled = true;

    });

    // 정답 표시
buttons[q.answer].style.background = "#4CAF50";
buttons[q.answer].style.color = "#ffffff";

// 오답 표시
if(selected !== q.answer){

    buttons[selected].style.background = "#F44336";
    buttons[selected].style.color = "#ffffff";

}

if(selected === q.answer){

    score++;

}else{

    wrongAnswers.push(q);

}

$("result").innerHTML = `
<h3>
${selected === q.answer ? "✅ 정답입니다." : "❌ 오답입니다."}
</h3>

<p>
${q.explanation || ""}
</p>
`;
showAIExplanation(q, selected);
await saveQuestionResult(q, selected);

if(selected !== q.answer){

    await saveWrongAnswer(q, selected);

}

    // 즐겨찾기 버튼
    show("bookmarkBtn");

    // 마지막 문제
    if(currentQuestion == quizList.length-1){

        show("submitBtn");

    }else{

        show("nextBtn");

    }

    updateQuestionNav();
    initBookmark();

if(q.id){

    checkBookmarkStatus(q.id);

}

}

// ===========================================
// 문제 통계
// ===========================================

async function saveQuestionResult(q, selected){

    if(!q.id) return;


    await db.collection("questionStats")
    .doc(q.id)
    .set({

        question:q.question,

        category:q.category,

        period:q.period || "",

        level:q.level || "",

        type:q.type || "",

        total:
        firebase.firestore.FieldValue.increment(1),


        correct:
        firebase.firestore.FieldValue.increment(
            selected===q.answer ? 1 : 0
        ),


        wrong:
        firebase.firestore.FieldValue.increment(
            selected===q.answer ? 0 : 1
        )


    },
    {
        merge:true
        difficulty:

q.level || "중",
    });


}

// ===========================================
// 즐겨찾기
// ===========================================

function addBookmark(q){

    let list =

    JSON.parse(

        localStorage.getItem("bookmarks")

    ) || [];

    const exist =

    list.find(function(item){

        return item.question === q.question;

    });

    if(exist){

        alert("이미 저장되어 있습니다.");

        return;

    }

    list.push(q);

    localStorage.setItem(

        "bookmarks",

        JSON.stringify(list)

    );

    alert("즐겨찾기에 저장되었습니다.");

}
// ===========================================
// 타이머
// ===========================================

function startTimer() {

    clearInterval(timer);

    timer = setInterval(function () {

        timeLeft--;

        const timerBox = document.getElementById("timer");

        if (timerBox) {
            timerBox.innerHTML =
                "⏰ 남은시간 : " + secondToText(timeLeft);
        }

        if (timeLeft <= 0) {

            clearInterval(timer);

            alert("시험 시간이 종료되었습니다.");

            submitExam();

        }

    }, 1000);

}

// ===========================================
// 시험 제출
// ===========================================

async function submitExam() {

    clearInterval(timer);

    const percent =
        Math.round(score / quizList.length * 100);
        const grade =
calculateGrade(score);

    alert(
        `시험 종료\n\n점수 : ${score}/${quizList.length}\n정답률 : ${percent}%`
    );

    await saveQuizHistory();

    showReport();
    

}

// ===========================================
// 시험 기록 저장
// ===========================================

async function saveQuizHistory() {

    await updateUserLevel();
    await updateStudyStreak();
    const user = auth.currentUser;

    if (!user) return;

    await db.collection("users")

        .doc(user.uid)

        .collection("quizHistory")

        .add({

score: score,

total: quizList.length,

percent:
Math.round(score / quizList.length * 100),

wrongCount:
wrongAnswers.length,


period:
$("periodSelect").value,


category:
$("categorySelect").value,


level:
$("levelSelect").value,


created:
firebase.firestore.FieldValue.serverTimestamp(),

difficultyScore:70,

viewCount:0,

solveCount:0,

correctCount:0,

updated:
firebase.firestore.FieldValue.serverTimestamp()

examType:

"모의고사",


grade:

calculateGrade(score),

});

}

// ===========================================
// 성적표
// ===========================================

function showReport() {

    hide("quizScreen");

    show("mainMenu");

    const percent =
        Math.round(score / quizList.length * 100);
        const grade =
calculateGrade(score);

    $("reportBox").innerHTML =
       `
<h2>시험 결과</h2>

<p>
점수 :
<b>${score}</b> /
${quizList.length}
</p>

<p>
정답률 :
<b>${percent}%</b>
</p>
<p>

예상 등급 :

<b>

${calculateGrade(score)}

</b>

</p>

<p>
오답 :
${wrongAnswers.length}문제
</p>

`;
const coaching =
createAICoachingReport();


if(coaching){


$("reportBox").innerHTML +=


`

<div class="questionBox">

<h3>
🤖 AI 학습 코칭
</h3>


<p>
현재 수준 :
<b>
${coaching.level}
</b>
</p>


<p>
정답률 :
${coaching.accuracy}%
</p>


<p>
추천 학습 :
${coaching.message}
</p>


<p>
취약 분야 :
${coaching.weak || "분석중"}
(${coaching.weakRate}%)
</p>


</div>

`;


}
    drawChart();


if(typeof showAIResult === "function"){

    showAIResult();

}

}

// ===========================================
// Chart.js
// ===========================================

function drawChart() {

    const area =
        $("reportChart");

    if (!area) return;

    area.innerHTML =

        `
<canvas id="scoreChart"></canvas>
`;

    const ctx =
        document.getElementById("scoreChart");

    new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "정답",

                "오답"

            ],

            datasets: [

                {

                    data: [

                        score,

                        wrongAnswers.length

                    ],

                    backgroundColor: [

                        "#4CAF50",

                        "#f44336"

                    ]

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

// ===========================================
// 오답 다시풀기
// ===========================================

function retryWrongQuestions() {

    if (wrongAnswers.length === 0) {

        alert("틀린 문제가 없습니다.");

        return;

    }

    quizList = [...wrongAnswers];

    currentQuestion = 0;

    score = 0;

    userAnswers =
        new Array(quizList.length).fill(null);

    wrongAnswers = [];

    timeLeft = quizList.length * 60;

    show("quizScreen");

    hide("mainMenu");

    buildQuestionNav();

    startTimer();

    showQuestion();

}

// ===========================================
// 시험 기록 보기
// ===========================================

async function loadMyHistory() {

    const user = auth.currentUser;

    if (!user) return;

    const snapshot = await db.collection("users")

        .doc(user.uid)

        .collection("quizHistory")

        .orderBy("created", "desc")

        .limit(20)

        .get();

    let html = "<h3>시험 기록</h3>";

    snapshot.forEach(function (doc) {

        const q = doc.data();

        html += `

<p>

점수 :

${q.score}/${q.total}

(

${q.percent}%

)

</p>

`;

    });

    $("myHistory").innerHTML = html;

}

// ===========================================
// 이벤트 등록
// ===========================================

if ($("wrongQuizBtn")) {

    $("wrongQuizBtn").onclick =
        retryWrongQuestions;

}

if ($("myHistoryBtn")) {

    $("myHistoryBtn").onclick =
        loadMyHistory;

}

// ===========================================
// Quiz 시작
// ===========================================

document.addEventListener(
"DOMContentLoaded",
function(){

    console.log("quiz 초기화");


    initQuiz();


    auth.onAuthStateChanged(
function(user){

    if(user){

        loadWrongMode();

        loadWrongQuizMode();

        loadRecommendMode();

    }

});


});

// ===========================================
// 오답 저장
// ===========================================

async function saveWrongAnswer(q, selected){

    const user = auth.currentUser;

    if(!user) return;


    const ref = db.collection("users")
    .doc(user.uid)
    .collection("wrongAnswers");


    const old =
    await ref
    .where("questionId","==",q.id)
    .get();


    if(!old.empty){

        return;

    }


    await ref.add({

        questionId:q.id,

        question:q.question,

        choices:q.choices,

        answer:q.answer,

        selected:selected,

        category:q.category || "",

        period:q.period || "",

        level:q.level || "",

        explanation:q.explanation || "",

        created:
        firebase.firestore.FieldValue.serverTimestamp()

    });

}
// ===========================================
// 오답노트 문제 불러오기
// ===========================================

async function loadWrongMode(){


    const params =
    new URLSearchParams(
        location.search
    );


    const wrongId =
    params.get("wrong");



    if(!wrongId)return;



    const user =
    auth.currentUser;



    if(!user)return;



    const doc =

    await db.collection("users")

    .doc(user.uid)

    .collection("wrongAnswers")

    .doc(wrongId)

    .get();



    if(!doc.exists)return;



    quizList=[doc.data()];


    currentQuestion=0;


    score=0;


    wrongAnswers=[];


    userAnswers=[null];



    hide("mainMenu");

    show("quizScreen");


    buildQuestionNav();


    showQuestion();


}
// ===========================================
// 오답모드 시작
// ===========================================

function loadWrongQuizMode(){


    const params =
    new URLSearchParams(
        location.search
    );


    if(
        params.get("mode")
        !==
        "wrong"
    ){

        return;

    }



    const data =

    sessionStorage.getItem(
        "wrongQuiz"
    );



    if(!data)return;



    quizList =
    JSON.parse(data);



    currentQuestion=0;

    score=0;

    wrongAnswers=[];


    userAnswers =

    new Array(
        quizList.length
    )
    .fill(null);



    hide("mainMenu");

    show("quizScreen");


    buildQuestionNav();


    timeLeft =
    quizList.length * 60;


    startTimer();


    showQuestion();


}

async function loadRecommendMode(){


const params =

new URLSearchParams(
location.search
);


const id =
params.get(
"recommend"
);



if(!id)return;



const doc =

await db.collection(
"questions"
)

.doc(id)

.get();



if(!doc.exists)return;



quizList=[doc.data()];


currentQuestion=0;


score=0;


wrongAnswers=[];


userAnswers=[null];


hide("mainMenu");

show("quizScreen");


showQuestion();


}
// ===========================================
// 모의고사 모드
// ===========================================


async function startMockExam(){


quizList =
await createMockExam();



if(
quizList.length < 50
){

alert(
"문제가 부족합니다."
);

return;

}



currentQuestion=0;

score=0;

wrongAnswers=[];


userAnswers =

new Array(
quizList.length
)
.fill(null);



examSeconds =

80 * 60;


timeLeft =
examSeconds;



hide(
"mainMenu"
);


show(
"quizScreen"
);



buildQuestionNav();


startTimer();


showQuestion();



}
// ===========================================
// 한능검 등급 계산
// ===========================================


function calculateGrade(score){


if(score>=45){

return "1급";

}


if(score>=40){

return "2급";

}


if(score>=35){

return "3급";

}


if(score>=25){

return "4급";

}


if(score>=20){

return "5급";

}


return "불합격";


}
// ===========================================
// 한능검 스타일 시험 생성
// ===========================================


async function createMockExam(){


let exam=[];



for(
const period in MOCK_PATTERN
){


const count =
MOCK_PATTERN[period];



const snapshot =

await db.collection(
"questions"
)

.where(
"period",
"==",
period
)

.get();



let list=[];



snapshot.forEach(function(doc){


let q =
doc.data();


q.id =
doc.id;


list.push(q);


});



// 랜덤

list.sort(
()=>Math.random()-0.5
);



// 필요한 수만 추가

exam.push(
...
list.slice(0,count)
);



}



// 배열 합치기

exam =
exam.flat();



// 전체 랜덤

exam.sort(
()=>Math.random()-0.5
);



return exam;


}
// ===========================================
// AI 한국사 선생님 해설
// ===========================================


function showAIExplanation(q,selected){


const area =
document.getElementById(
"aiExplainBox"
);



if(!area)return;



let result="";



if(selected===q.answer){


result=

`

<h3>
🤖 AI 선생님
</h3>


<p>
정답입니다.

이 문제의 핵심 개념을 잘 이해했습니다.

</p>


<p>

📌 핵심 키워드 :

${q.keywords || ""}

</p>

`;



}

else{


result=

`

<h3>
🤖 AI 선생님 오답 분석
</h3>


<p>

선택한 답 :

${selected+1}번

</p>


<p>

정답 :

${q.answer+1}번

</p>


<p>

틀린 이유 :

보기의 핵심 개념을 다시 확인하세요.

</p>


<p>

📚 학습 포인트 :

${q.explanation || ""}

</p>


`;

}


area.innerHTML=result;


}
// ===========================================
// 학습 포인트 계산
// ===========================================


async function updateUserLevel(){


const user =
auth.currentUser;


if(!user)return;



const ref =

db.collection("users")

.doc(user.uid);



const snap =
await ref.get();



let point = 0;



if(snap.exists &&
snap.data().point){


point =
snap.data().point;


}



point += score * 10;



let level =
calculateUserLevel(point);



await ref.set({

point:point,


level:level,


lastStudy:

firebase.firestore.FieldValue
.serverTimestamp()


},

{

merge:true

});


}
function calculateUserLevel(point){


if(point>=5000){

return "Lv.5 한국사 전문가";

}


if(point>=3000){

return "Lv.4 한능검 준비생";

}


if(point>=1500){

return "Lv.3 한국사 도전자";

}


if(point>=500){

return "Lv.2 한국사 학습자";

}


return "Lv.1 역사 입문자";


}
if(
"serviceWorker" in navigator
){


navigator.serviceWorker.register(

"service-worker.js"

)

.then(function(){

console.log(
"PWA 설치 준비 완료"
);


});


}
async function updateStudyStreak(){


const user =
auth.currentUser;


if(!user)return;



const ref =

db.collection("users")
.doc(user.uid);



const doc =
await ref.get();



let data =
doc.data() || {};



let streak =
data.streak || 0;



const today =
new Date()
.toISOString()
.substring(0,10);



if(data.lastStudyDate !== today){


streak++;


}



await ref.set({

streak:streak,

lastStudyDate:today


},

{

merge:true

});


}

async function updateRanking(){


const user =
auth.currentUser;


if(!user)return;



const profile =

await db.collection("users")

.doc(user.uid)

.get();



const data =
profile.data();



await db.collection("ranking")

.doc(user.uid)

.set({

nickname:
data.nickname || "학습자",

point:
data.point || 0,

level:
data.level || "Lv.1"


});


}