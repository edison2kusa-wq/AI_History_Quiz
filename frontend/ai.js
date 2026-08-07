// =====================================
// AI 한국사
// ai.js
// =====================================


// 추천 문제 목록

let aiQuizList = [];



// =====================================
// AI 추천 시험 시작
// =====================================

async function startAIRecommend(){


    const user = auth.currentUser;


    if(!user){


        alert(
            "로그인이 필요합니다."
        );


        return;

    }



    try{


        const weakCategory =

        await getWeakCategory();



        const snapshot =

        await db

        .collection("questions")

        .get();



        let candidates=[];



        for (const doc of snapshot.docs) {

    const q = doc.data();

    q.id = doc.id;


    // 문제 통계 가져오기
    const statDoc =
    await db
    .collection("questionStats")
    .doc(doc.id)
    .get();


    if(statDoc.exists){

        const stat = statDoc.data();


        q.solveCount =
        stat.total || 0;


        q.wrongCount =
        stat.wrong || 0;


    }
    else{

        q.solveCount = 0;

        q.wrongCount = 0;

    }


}


if(statDoc.exists){

    const stat = statDoc.data();

    q.solveCount =
    stat.total || 0;


    q.wrongCount =
    stat.wrong || 0;


}
else{

    q.solveCount=0;

    q.wrongCount=0;

}



if(
!weakCategory ||
q.category===weakCategory
){

    candidates.push(q);

}


        // 부족하면 전체 문제 사용

        if(candidates.length < 20){

    candidates=[];


    snapshot.forEach(function(doc){

        const q = doc.data();

        q.id = doc.id;

        q.solveCount = 0;

        q.wrongCount = 0;


        candidates.push(q);

    });

}


        const userLevel =

await analyzeUserLevel();



candidates =

sortAIQuestions(

    candidates,

    weakCategory,

    userLevel

);



aiQuizList =

candidates.slice(0,20);



        quizList =
        aiQuizList;



        currentQuestion=0;


        score=0;


        wrongAnswers=[];
        userAnswers =
new Array(
quizList.length
)
.fill(null);


timeLeft =
quizList.length * 60;


startTimer();


buildQuestionNav();


        document

        .getElementById(
            "mainMenu"
        )

        .style.display="none";



        document

        .getElementById(
            "quizScreen"
        )

        .style.display="block";



        showQuestion();

        saveAIRecommend();

        showAIResult();


    }


    catch(e){


        console.error(e);


        alert(
            "AI 추천 시험 생성 실패"
        );


    }


}

function shuffleArray(array){


    for(

        let i=array.length-1;

        i>0;

        i--

    ){


        const j =

        Math.floor(
            Math.random()*(i+1)
        );


        [

        array[i],

        array[j]

        ]

        =

        [

        array[j],

        array[i]

        ];


    }


    return array;

}

async function getWeakCategory(){


    const user =
    auth.currentUser;


    if(!user)
    return null;



    const snapshot =

    await db

    .collection("users")

    .doc(user.uid)

    .collection("wrongAnswers")

    .get();



    const count={};



    for(const doc of snapshot.docs){


    const q = doc.data();

    q.id = doc.id;


    const statDoc =
        await db
        .collection("questionStats")
        .doc(doc.id)
        .get();


    if(statDoc.exists){

        const stat = statDoc.data();

        q.solveCount =
        stat.total || 0;


        q.wrongCount =
        stat.wrong || 0;

    }
    else{

        q.solveCount = 0;

        q.wrongCount = 0;

    }



    if(
        !weakCategory ||
        q.category === weakCategory
    ){

        candidates.push(q);

    }

}



    let max=null;


    let value=0;



    Object.keys(count)

    .forEach(function(key){



        if(count[key]>value){


            value=count[key];


            max=key;


        }


    });



    return max;


}

// =====================================
// 사용자 학습 수준 분석
// =====================================

async function analyzeUserLevel(){


    const user =
    auth.currentUser;



    if(!user){

        return "중";

    }



    const snapshot =

    await db

    .collection("users")

    .doc(user.uid)

    .collection("quizHistory")

    .orderBy(
        "created",
        "desc"
    )

    .limit(5)

    .get();



    let total=0;

    let score=0;



    snapshot.forEach(function(doc){


        const q =
        doc.data();


        total +=
        q.total || 0;


        score +=
        q.score || 0;


    });



    if(total===0){

        return "중";

    }



    const rate =

    score /

    total *

    100;



    if(rate>=85){

        return "상";

    }



    if(rate<60){

        return "중";

    }



    return "중상";


}

// =====================================
// AI 추천 점수 계산
// =====================================

function calculateAIWeight(
    q,
    weakCategory,
    level
){

    let weight = 0;


    // 1. 개인 취약 분야
    if(
        q.category === weakCategory
    ){

        weight += 30;

    }



    // 2. 난이도 맞춤

    if(
        q.level === level
    ){

        weight += 10;

    }



    // 3. 전체 오답률

    if(
        q.solveCount > 0
    ){

        const wrongRate =

        (
            q.wrongCount /
            q.solveCount
        )
        *100;



        weight += Math.min(
            wrongRate,
            20
        );

    }



    // 4. 많이 틀린 개인 문제

    if(
        wrongAnswers &&
        wrongAnswers.length
    ){


        const exist =

        wrongAnswers.some(
            function(w){

                return w.id === q.id;

            }
        );


        if(exist){

            weight += 30;

        }

    }



    // 5. 중요 문제

    if(
        q.type === "기출"
    ){

        weight += 10;

    }


    if(
        q.type === "예상"
    ){

        weight += 5;

    }



    // 6. 오래된 미학습 문제

    if(q.updated){

        const days =

        (
            Date.now()
            -
            q.updated.toDate()
        )
        /
        86400000;


        if(days>30){

            weight += 10;

        }

    }



    return Math.round(weight);

}
// =====================================
// 추천 결과 메시지
// =====================================

async function showAIResult(){

    const box =
    document.getElementById(
        "reportBox"
    );


    if(!box) return;


  let weak = [];

if(typeof getWeakArea === "function"){

    weak = await getWeakArea();

}


    let weakHtml="";


    weak.forEach(function(item,index){

        weakHtml +=

        `
        <p>
        ${index+1}순위 :
        ${item.name}
        (${item.score}%)
        </p>
        `;

    });



    const reason = getAIReason();



    let reasonHtml="";


    reason.text.forEach(function(item){

        reasonHtml +=

        `
        <li>
        ${item}
        </li>
        `;

    });



    box.innerHTML +=


    `

    <div class="questionBox">


    <h3>
    🤖 AI 학습 분석 완료
    </h3>


    <h4>
    📌 취약 분야
    </h4>


    ${weakHtml}



    <h4>
    🎯 추천 기준
    </h4>


    <ul>

    ${reasonHtml}

    </ul>



    <h4>
    📝 추천 문제
    </h4>


    <p>
    ${aiQuizList.length}문제 생성
    </p>
   <h4>
📌 추천 문제 분석
</h4>


${
aiQuizList.slice(0,5)

.map(function(q,index){

    const reasons =
    getQuestionAIReason(q);


    return `

    <div class="questionBox">

    <b>
    ${index+1}번 문제
    </b>

    <p>
    ${q.question}
    </p>


    <p>
    🤖 AI 추천 점수 :
    ${
    calculateAIWeight(
        q,
        "",
        ""
    )
    }
    점
    </p>


    <ul>

    ${
    reasons.map(function(r){

        return `
        <li>
        ${r}
        </li>
        `;

    }).join("")

    }

    </ul>


    </div>

    `;


}).join("")

}
    </div>

    `;

}

// =====================================
// AI 추천 문제 점수화
// =====================================

function sortAIQuestions(list, weakCategory, userLevel){


    return list.sort(function(a,b){


        const aScore =

        calculateAIWeight(

            a,

            weakCategory,

            userLevel

        );



        const bScore =

        calculateAIWeight(

            b,

            weakCategory,

            userLevel

        );



        return bScore-aScore;


    });


}

// =====================================
// AI 추천 기록 저장
// =====================================

async function saveAIRecommend(){


    const user =
    auth.currentUser;


    if(!user) return;



    try{


        await db

        .collection("users")

        .doc(user.uid)

        .collection("aiHistory")

        .add({


            count:

            aiQuizList.length,


            created:

            firebase.firestore.FieldValue.serverTimestamp(),


            type:

            "AI추천시험",


            reason:

            "최근 오답 및 취약 분야 분석 기반"


        });


    }


    catch(e){


        console.error(e);


    }


}

function getAIReason(){


    return {

        title:
        "AI 추천 기준",


        text:

        [

        "최근 틀린 문제 분석",

        "취약 분야 우선 출제",

        "현재 학습 수준 반영",

        "부족한 영역 반복 학습"

        ]

    };


}

// =====================================
// AI 추천 버튼 연결
// =====================================

document.addEventListener(
"DOMContentLoaded",
function(){

    console.log("AI 추천 초기화");


    const btn =
    document.getElementById(
        "aiRecommendBtn"
    );


    if(btn){

        btn.onclick =
        startAIRecommend;

    }


});

function getQuestionAIReason(q){

    let reason = [];


    // 개인 오답
    if(
        wrongAnswers &&
        wrongAnswers.some(function(w){

            return w.id === q.id;

        })
    ){

        reason.push(
            "❌ 내가 이전에 틀린 문제"
        );

    }



    // 취약 분야

    if(
        q.category
    ){

        reason.push(
            "📚 "
            +
            q.category
            +
            " 분야 학습"
        );

    }



    // 전체 오답률

    if(
        q.solveCount > 0
    ){

        const rate =

        Math.round(

            q.wrongCount /
            q.solveCount *
            100

        );


        if(rate>=50){

            reason.push(

            "⚠ 전체 오답률 "
            +
            rate
            +
            "%"

            );

        }

    }



    // 난이도

    if(q.level){

        reason.push(

        "🎯 난이도 : "
        +
        q.level

        );

    }



    // 출제 유형

    if(q.type){

        reason.push(

        "📝 유형 : "
        +
        q.type

        );

    }



    if(reason.length===0){

        reason.push(
            "AI 학습 균형 문제"
        );

    }


    return reason;

}

function createAICoachingReport(){

    const total =
    quizList.length;


    const rate =
    Math.round(
        score /
        total *
        100
    );


    let message="";


    if(rate>=90){

        message=
        "최상위 수준입니다. 고난도 문제와 사료 분석 문제를 추천합니다.";

    }

    else if(rate>=70){

        message=
        "기본 개념은 안정적입니다. 취약 시대 반복 학습이 필요합니다.";

    }

    else{

        message=
        "기초 개념 복습 후 시대별 학습을 권장합니다.";

    }



    return {


        score:rate,


        message:message,


        weak:getWeakArea()


    };


}