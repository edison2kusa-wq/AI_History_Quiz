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

await saveQuestionResult(q, selected);

if(selected !== q.answer){

    await saveWrongAnswer(q, selected);

}

    // 즐겨찾기 버튼
    show("bookmarkBtn");

    $("bookmarkBtn").onclick = function(){

        addBookmark(q);

    };

    // 마지막 문제
    if(currentQuestion == quizList.length-1){

        show("submitBtn");

    }else{

        show("nextBtn");

    }

    updateQuestionNav();

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