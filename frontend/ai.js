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



        snapshot.forEach(function(doc){


            const q = doc.data();


            q.id =
            doc.id;



            if(

            !weakCategory ||

            q.category===weakCategory

            ){


                candidates.push(q);


            }


        });




        // 부족하면 전체 문제 사용

        if(candidates.length < 20){


            candidates=[];



            snapshot.forEach(function(doc){


                const q =
                doc.data();


                q.id =
                doc.id;


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



    snapshot.forEach(function(doc){


        const q =
        doc.data();


        const c =

        q.category || "전체";



        if(!count[c]){


            count[c]=0;


        }


        count[c]++;


    });



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

function calculateAIWeight(q, weakCategory, level){

    let weight = 0;


    // 1. 개인 취약 분야
    if(q.category === weakCategory){

        weight += 50;

    }


    // 2. 사용자 수준 맞춤
    if(q.level === level){

        weight += 30;

    }


    // 3. 내가 틀린 문제
    if(
        wrongAnswers.some(function(w){

            return w.id === q.id;

        })
    ){

        weight += 100;

    }


    // 4. 전체 사용자 오답률 반영
    if(q.wrongCount){

        weight += q.wrongCount * 5;

    }


    // 5. 많이 출제된 문제 우선
    if(q.solveCount){

        weight += Math.min(
            q.solveCount,
            20
        );

    }


    // 6. 오래 안 푼 문제 보정
    if(q.updated){

        weight += 5;

    }


    return weight;

}

// =====================================
// 추천 결과 메시지
// =====================================

function showAIResult(){

    const box =
    document.getElementById(
        "reportBox"
    );


    if(!box) return;


    const weak =
    getWeakArea();


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

