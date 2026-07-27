// console.log(db);

let quizList = [];
let currentQuestion = 0;
let score = 0;
let wrongAnswers = [];
let timer;
let timeLeft = 0;
let examSeconds = 0;

let userAnswers = [];
let questionNav;
const mainMenu =
document.getElementById("mainMenu");

const quizScreen =
document.getElementById("quizScreen");


// 기본 문제 + 관리자 추가 문제 합치기

async function getAllQuestions(){


    const savedQuestions =
    JSON.parse(
        localStorage.getItem("questions")
    ) || [];



    let firestoreQuestions = [];



    try{


        const snapshot =
        await db.collection("questions")
        .get();



        snapshot.forEach(function(doc){


            const q = doc.data();
            q.id = doc.id;


            // 테스트 데이터 제외

            if(q.question){

                firestoreQuestions.push(q);

            }


        });



    }

    catch(error){

        console.log(
        "Firestore 문제 불러오기 오류",
        error
        );

    }



    return [

        ...questions,

        ...firestoreQuestions,

        ...savedQuestions

    ];


}

const MAX_QUESTIONS = 10;


// 문제 섞기
function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
        [array[j], array[i]];

    }

}



// 시험 시작
document.getElementById("startBtn").onclick=function(){

    document.getElementById("settingMenu")
    .style.display="block";

};





document.getElementById("settingStartBtn")
.onclick=async function(){


    document.getElementById("mainMenu")
    .style.display="none";


    document.getElementById("quizScreen")
    .style.display="block";



    let period =
    document.getElementById("periodSelect").value;


    let category =
    document.getElementById("categorySelect").value;


    let level =
    document.getElementById("levelSelect").value;



    let count =
    Number(
        document.getElementById("countSelect").value
    );

    if (count == 10) {

    examSeconds = 10 * 60;

} else if (count == 20) {

    examSeconds = 20 * 60;

} else {

    examSeconds = 50 * 60;

}

timeLeft = examSeconds;

startTimer();


    const allQuestions = await getAllQuestions();

quizList = allQuestions.filter(function(q){

    let result = true;

    if(period !== "전체"){

        result = result &&
                 q.year === period;

    }

    if(category !== "전체"){

        result = result &&
                 q.category === category;

    }

    if(level !== "전체"){

        result = result &&
                 q.level === level;

    }

    return result;

});



    if(quizList.length===0){

        alert(
        "조건에 맞는 문제가 없습니다."
        );

        location.reload();

        return;

    }



    shuffle(quizList);



    quizList =
    quizList.slice(
        0,
        Math.min(count, quizList.length)
    );



    currentQuestion=0;

    score=0;

    wrongAnswers=[];

    userAnswers = new Array(quizList.length).fill(null);

    showQuestion();


};

function createQuestionNav(){

    const nav =
    document.getElementById("questionNav");


    if(!nav) return;


    nav.innerHTML="";


    quizList.forEach(function(q,index){


        const btn =
        document.createElement("button");


        btn.innerText =
        index + 1;


        btn.className="navBtn";


        // 문제 이동
        btn.onclick=function(){

            currentQuestion = index;

            showQuestion();

        };


        // 기본색
        btn.style.background="#eeeeee";


        // 푼 문제 표시
        if(userAnswers[index] !== null){

            btn.style.background="#4CAF50";
            btn.style.color="white";

        }


        // 현재 문제 표시
        if(index === currentQuestion){

            btn.style.background="#2196F3";
            btn.style.color="white";

        }


        nav.appendChild(btn);


    });


}

// 문제 표시
function showQuestion(){
    createQuestionNav();
    const q = quizList[currentQuestion];
    const img =
document.getElementById("questionImage");

if(q.image){

    img.src = q.image;

    img.style.display = "block";

}else{

    img.style.display = "none";

}
    q.count =
(q.count || 0) + 1;
    document.getElementById("progress").innerText =
    `문제 ${currentQuestion + 1} / ${quizList.length}`;

    document.getElementById("question").innerText =
    q.question;

    const img =
    document.getElementById("questionImage");

    if(q.image && q.image.trim() !== ""){

        img.src = q.image;
        img.style.display = "block";

    }else{

        img.style.display = "none";

    }

    const choiceBox =
    document.getElementById("choices");

    choiceBox.innerHTML="";


// 첫 문제에서는 이전 버튼 숨김
if (currentQuestion === 0) {

    document.getElementById("prevBtn").style.display = "none";

} else {

    document.getElementById("prevBtn").style.display = "inline-block";

}

    q.choices.forEach(function(choice,index){

        const button =
        document.createElement("button");

        button.innerText =
        `${index+1}. ${choice}`;

        button.dataset.index = index;
        if (userAnswers[currentQuestion] === index) {
    button.style.background = "#2196F3";
    button.style.color = "#fff";
}
       button.onclick = function () {

    checkAnswer(index);

};

        choiceBox.appendChild(button);

    });

    document.getElementById("result").innerHTML="";

    document.getElementById("nextBtn").style.display="none";
    document.getElementById("submitBtn").style.display ="none";
    let percent =
    (currentQuestion / quizList.length) * 100;

    document.getElementById("progressBar").style.width =
    percent + "%";
    document.querySelectorAll(".navBtn")
.forEach(function(btn,index){


    btn.style.background="#eee";


    if(userAnswers[index] !== null){

        btn.style.background="#4CAF50";
        btn.style.color="#fff";

    }


    if(index === currentQuestion){

        btn.style.background="#2196F3";
        btn.style.color="#fff";

    }


});
document.getElementById("bookmarkBtn").style.display = "inline-block";
}

function startTimer() {

    clearInterval(timer);

    updateTimer();

    timer = setInterval(function () {

        timeLeft--;

        updateTimer();

        if (timeLeft <= 0) {

            clearInterval(timer);

            alert("시험 시간이 종료되었습니다.");

            saveResult();

            showResult();

        }

    }, 1000);

}

function updateTimer() {

    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");

    document.getElementById("timer").innerText =
        `⏰ 남은시간 : ${min}:${sec}`;

}

// 정답 확인
function checkAnswer(selected){

    userAnswers[currentQuestion] = selected;


    const q = quizList[currentQuestion];


    if(selected === q.answer){


        document.getElementById("result").innerHTML =

        `
        <p style="color:green;">
        ⭕ 정답입니다!
        </p>

        <p>
        ${q.explanation}
        </p>
        `;


    }

    else{


        if (!wrongAnswers.some(item => item.question === q.question)) {

            wrongAnswers.push(q);

        }


        document.getElementById("result").innerHTML =

        `
        <p style="color:red;">
        ❌ 오답입니다.
        </p>

        <p>
        정답 : ${q.choices[q.answer]}
        </p>

        <p>
        ${q.explanation}
        </p>
        `;


    }



    document.getElementById("nextBtn").style.display =
    "block";


    const buttons =
    document.querySelectorAll("#choices button");


    buttons.forEach(function(btn){


        const idx = Number(btn.dataset.index);


        if(idx === q.answer){

            btn.style.background = "#4CAF50";
            btn.style.color = "#fff";

        }


        else if(idx === selected){

            btn.style.background = "#E53935";
            btn.style.color = "#fff";

        }


        else{

            btn.style.opacity = "0.5";

        }


    });
createQuestionNav();

}

// 다음 문제
document.getElementById("nextBtn").onclick=function(){


    currentQuestion++;

if(currentQuestion < quizList.length){

    showQuestion();

}

    else{

    document.getElementById("submitBtn").style.display =
    "block";

}


};



// 결과 저장
function saveResult(){


    localStorage.setItem(

        "wrongAnswers",

        JSON.stringify(wrongAnswers)

    );

    // 취약 분야 분석 저장

let weakCategory =
JSON.parse(
localStorage.getItem("weakCategory")
)
|| {};



wrongAnswers.forEach(function(q){


let c =
q.category || "기타";


if(!weakCategory[c]){

weakCategory[c]=0;

}


weakCategory[c]++;


});
// Firebase 취약 분야 저장

const user =
auth.currentUser;


if(user){


let categoryData = {};


quizList.forEach(function(q,index){


let category =
q.category || "기타";


if(!categoryData[category]){

categoryData[category]={

total:0,

correct:0

};

}


categoryData[category].total++;


if(userAnswers[index] === q.answer){

categoryData[category].correct++;

}


});



Object.keys(categoryData)
.forEach(function(category){


const data =
categoryData[category];


db.collection("users")
.doc(user.uid)
.collection("categoryStats")
.doc(category)
.set({

category:category,

total:data.total,

correct:data.correct,

updated:new Date()


},{merge:true});


});


}


localStorage.setItem(

"weakCategory",

JSON.stringify(weakCategory)

);


    const history =

    JSON.parse(

        localStorage.getItem("quizHistory")

    ) || [];



    history.push({

date:
new Date().toLocaleString(),

score:
score,

total:
quizList.length,

percent:
Math.round(
score / quizList.length * 100
),


category:

quizList.map(function(q){

return q.category;

})

});

// 로그인 사용자 확인 후 저장

const user = auth.currentUser;


if(user){


    // 시험 기록 저장

    db.collection("users")
    .doc(user.uid)
    .collection("quizHistory")
    .add({

    date:
    new Date().toLocaleString(),

    score:
    score,

    total:
    quizList.length,


    percent:
    Math.round(
        score / quizList.length * 100
    ),


    wrongCount:
    wrongAnswers.length

})
    .then(()=>{

        console.log(
        "사용자 시험 기록 저장 완료"
        );

    });



    // 오답 저장

    if(wrongAnswers.length > 0){


        wrongAnswers.forEach(function(q){


            db.collection("users")
            .doc(user.uid)
            .collection("wrongAnswers")
            .add({

                questionId:
                q.id,
                q.question,

                choices:
                q.choices,

                answer:
                q.answer,

                explanation:
                q.explanation,

                date:
                new Date().toLocaleString()

            });


        });


    }


}


    localStorage.setItem(

        "quizHistory",

        JSON.stringify(history)

    );


}



// 결과 화면
function showResult(){

    clearInterval(timer);


    const percent =
    Math.round(
        score / quizList.length * 100
    );


    const wrongCount =
    quizList.length - score;

    // 취약 분야 분석

let weakCategory = {};


wrongAnswers.forEach(function(q){

    const category =
    q.category || "기타";


    if(!weakCategory[category]){

        weakCategory[category] = 0;

    }


    weakCategory[category]++;

});



let weakText = "";


Object.keys(weakCategory)
.sort(function(a,b){

    return weakCategory[b] - weakCategory[a];

})
.slice(0,3)
.forEach(function(category,index){


    weakText += `

    <p>

    ${index+1}위 :
    ${category}

    (${weakCategory[category]}문제 오답)

    </p>

    `;


});


    const usedTime =
    examSeconds - timeLeft;


    const min =
    Math.floor(usedTime / 60);


    const sec =
    usedTime % 60;



    let resultText =
    percent >= 80
    ? "합격"
    : "불합격";


    let color =
    percent >= 80
    ? "#4CAF50"
    : "#E53935";



    document.querySelector(".container").innerHTML =


`
<div style="
text-align:center;
padding:30px;
">


<h1>
시험 종료
</h1>


<h2 style="
color:${color};
font-size:40px;
">

${resultText}

</h2>



<div style="
font-size:25px;
margin:20px;
">

${score} / ${quizList.length}

</div>



<div style="
background:#ddd;
height:30px;
border-radius:15px;
overflow:hidden;
margin:20px;
">


<div style="
width:${percent}%;
height:100%;
background:${color};
">

</div>


</div>



<p>
정답률 : ${percent}%
</p>


<p>
⭕ 맞은 문제 : ${score}개
</p>


<p>
❌ 틀린 문제 : ${wrongCount}개
</p>


<p>
시험시간 :
${min}분 ${sec}초
</p>
<hr>

<h3>
취약 분야 분석
</h3>


<div style="
background:#f5f5f5;
padding:15px;
border-radius:10px;
">


${
weakText
||
"전체 분야를 고르게 잘 풀었습니다."
}


</div>


<button onclick="location.reload()">

다시 시험

</button>



<button onclick="retryWrongQuestions()">

오답 다시 풀기

</button>


<button onclick="
document.getElementById('wrongNoteBtn').click();
">

오답노트 보기

</button>

</div>

`;

}

// 시험 기록
document.getElementById("historyBtn").onclick=function(){


    const history =

    JSON.parse(

        localStorage.getItem("quizHistory")

    ) || [];



    if(history.length===0){

        alert("시험 기록이 없습니다.");

        return;

    }



    let text="시험 기록\n\n";



    history.forEach(function(item,index){


        text +=

        `${index+1}회 : ${item.score}/${item.total}\n`;

        text +=

        `${item.date}\n\n`;

    });



    alert(text);


};
document.getElementById("weakBtn").onclick = async function(){

    const user = auth.currentUser;


    if(!user){

        alert(
        "로그인이 필요합니다."
        );

        return;

    }


    try{


        const snapshot = await db.collection("users")
        .doc(user.uid)
        .collection("categoryStats")
        .get();



        if(snapshot.empty){

            alert(
            "아직 학습 데이터가 없습니다."
            );

            return;

        }



        let text =
        "📈 나의 한국사 학습 분석\n\n";


        let weakField = "";
        let lowestRate = 101;



        snapshot.forEach(function(doc){


            const data =
            doc.data();



            const accuracy =
            Math.round(
                data.correct /
                data.total *
                100
            );



            let star;


            if(accuracy >= 90){

                star="★★★★★";

            }
            else if(accuracy >=70){

                star="★★★★☆";

            }
            else if(accuracy >=50){

                star="★★★☆☆";

            }
            else if(accuracy >=30){

                star="★★☆☆☆";

            }
            else{

                star="★☆☆☆☆";

            }



            text +=

            data.category +
            "\n" +

            "응시 : " +
            data.total +
            "문제\n" +

            "정답률 : " +
            accuracy +
            "%\n" +

            "학습상태 : " +
            star +
            "\n\n";



            if(accuracy < lowestRate){

                lowestRate = accuracy;

                weakField =
                data.category;

            }


        });



        text +=
        "----------------\n";


        text +=
        "집중 학습 추천 : " +
        weakField;



        alert(text);



    }
    catch(error){


        console.error(error);

        alert(
        "분석 데이터를 불러오지 못했습니다."
        );


    }


};

// 분야별 문제(다음 버전)
// 분야별 메뉴 열기

document.getElementById("categoryBtn").onclick=function(){

    document.getElementById("categoryMenu").style.display="block";

};




// 분야별 시험 시작

document.querySelectorAll(".category")
.forEach(function(button){


    button.onclick = async function(){


        const category =
        this.dataset.category;



        document.getElementById("mainMenu").style.display="none";

        document.getElementById("quizScreen").style.display="block";



        const allQuestions = await getAllQuestions();

quizList = allQuestions.filter(function(q){
    return q.category === category;
});



        shuffle(quizList);



        quizList =
        quizList.slice(
            0,
            Math.min(MAX_QUESTIONS, quizList.length)
        );



        currentQuestion=0;

        score=0;

        wrongAnswers=[];
        userAnswers = new Array(quizList.length).fill(null);


        if(quizList.length===0){

            alert(
            "해당 분야 문제가 없습니다."
            );

            location.reload();

            return;

        }



        showQuestion();


    };


});

function shareQuiz(){


    if(navigator.share){


        navigator.share({

            title:
            "AI 한국사 심화 퀴즈",

            text:
            "한국사 모의시험 결과 확인하기",

            url:
            location.href

        });


    }

    else{


        alert(
        "공유 기능을 지원하지 않는 브라우저입니다."
        );


    }

}

// 회원가입

document.getElementById("signupBtn")
.onclick=function(){


const email =
document.getElementById("email").value;


const password =
document.getElementById("password").value;



auth.createUserWithEmailAndPassword(
    email,
    password
)

.then(function(){

    alert(
    "회원가입 완료"
    );

})

.catch(function(error){

    alert(
    error.message
    );

});


};





// 로그인

document.getElementById("loginBtn")
.onclick=function(){


const email =
document.getElementById("email").value;


const password =
document.getElementById("password").value;



auth.signInWithEmailAndPassword(
    email,
    password
)

.then(function(){

    alert(
    "로그인 성공"
    );

})

.catch(function(error){

    alert(
    error.message
    );

});


};
document.getElementById("myHistoryBtn")
.onclick = function(){


const user = auth.currentUser;


if(!user){

    alert(
    "로그인이 필요합니다."
    );

    return;

}



db.collection("users")
.doc(user.uid)
.collection("quizHistory")
.orderBy("date","desc")
.get()

.then(function(snapshot){


let html =
"<h2>나의 시험 기록</h2>";



if(snapshot.empty){

html +=
"<p>시험 기록이 없습니다.</p>";

}


snapshot.forEach(function(doc){


const data = doc.data();


html += `

<div>

<p>
날짜 : ${data.date}
</p>


<p>
점수 :
${data.score}/${data.total}
</p>


<p>
오답 :
${data.wrongCount}개
</p>

<hr>

</div>

`;


});



document.getElementById(
"myHistory"
).innerHTML = html;


});


};

document.getElementById("wrongNoteBtn")
.onclick=function(){


const user = auth.currentUser;


if(!user){

alert(
"로그인이 필요합니다."
);

return;

}



db.collection("users")
.doc(user.uid)
.collection("wrongAnswers")
.get()

.then(function(snapshot){


let html =
"<h2>오답노트</h2>";



if(snapshot.empty){

html +=
"<p>오답 기록이 없습니다.</p>";

}



snapshot.forEach(function(doc){


const q =
doc.data();



html += `

<div>

<h3>
${q.question}
</h3>


<p>
정답 :
${q.choices[q.answer]}
</p>


<p>
해설 :
${q.explanation}
</p>


<hr>

</div>

`;



});



document.getElementById(
"wrongNote"
).innerHTML = html;



});


};

document.getElementById("wrongQuizBtn")
.onclick = function(){


const user = auth.currentUser;


if(!user){

alert(
"로그인이 필요합니다."
);

return;

}



db.collection("users")
.doc(user.uid)
.collection("wrongAnswers")
.get()

.then(function(snapshot){


let wrongList = [];



snapshot.forEach(function(doc){


const q = doc.data();
q.id = doc.id;


wrongList.push({

question:
q.question,


choices:
q.choices,


answer:
q.answer,


explanation:
q.explanation


});


});



if(wrongList.length === 0){

alert(
"오답 문제가 없습니다."
);

return;

}



// 기존 문제 목록 교체

quizList = wrongList;


currentQuestion = 0;

score = 0;

wrongAnswers = [];



mainMenu.style.display="none";

quizScreen.style.display="block";



showQuestion();


});


};
document.getElementById("prevBtn").onclick = function () {

    if (currentQuestion > 0) {

        currentQuestion--;

        showQuestion();

    }

};
document.getElementById("submitBtn").onclick = function(){

    let unanswered = [];

    userAnswers.forEach(function(answer,index){

        if(answer === null){

            unanswered.push(index + 1);

        }

    });


    if(unanswered.length > 0){

        let check =
        confirm(
        "풀지 않은 문제가 있습니다.\n\n" +
        "문제 번호 : " +
        unanswered.join(", ") +
        "\n\n제출하시겠습니까?"
        );


        if(!check){

            return;

        }

    }


    score = 0;

    wrongAnswers = [];


   quizList.forEach(function(q,index){


    const isCorrect =
    userAnswers[index] === q.answer;


    const correct =
userAnswers[index] === q.answer;


if(correct){

    score++;

}
else{

    wrongAnswers.push(q);

}


// 분야별 통계 저장

saveCategoryStats(
    q,
    correct
);


    saveQuestionStats(
        q,
        isCorrect
    );


});


    saveResult();

    showResult();


};

// AI 추천 시험

document.getElementById("aiRecommendBtn")
.onclick=function(){


const user = auth.currentUser;


if(!user){

    alert("로그인이 필요합니다.");
    return;

}



db.collection("users")
.doc(user.uid)
.collection("wrongAnswers")
.get()

.then(function(snapshot){


let recommendList=[];



snapshot.forEach(function(doc){


const q=doc.data();


recommendList.push({

question:q.question,

choices:q.choices,

answer:q.answer,

explanation:q.explanation

});


});



if(recommendList.length===0){


alert(
"분석할 오답 데이터가 없습니다.\n먼저 시험을 응시해주세요."
);


return;

}



// 오답 기반 시험 생성


shuffle(recommendList);


quizList =
recommendList.slice(0,10);



currentQuestion=0;

score=0;

wrongAnswers=[];

userAnswers =
new Array(quizList.length).fill(null);



mainMenu.style.display="none";

quizScreen.style.display="block";


showQuestion();



});


};

// 학습 리포트

document.getElementById("reportBtn")
.onclick=function(){


const history =

JSON.parse(
localStorage.getItem("quizHistory")
)
|| [];



const weakCategory =

JSON.parse(
localStorage.getItem("weakCategory")
)
|| {};



if(history.length === 0){

alert(
"아직 시험 기록이 없습니다."
);

return;

}



// 총 응시 횟수

let totalExam =
history.length;



// 평균 점수

let avg =
0;


history.forEach(function(item){

avg += item.percent || 0;

});


avg =
Math.round(avg / totalExam);



// 최고 점수

let maxScore =
Math.max.apply(null,

history.map(function(item){

return item.percent || 0;

})

);



// 합격 횟수

let passCount =

history.filter(function(item){

return (item.percent || 0) >= 80;

}).length;



let passRate =

Math.round(
(passCount / totalExam) * 100
);



// 취약 분야 정렬


let weakList =

Object.keys(weakCategory);



weakList.sort(function(a,b){

return weakCategory[b]-weakCategory[a];

});



let weakText =

weakList
.slice(0,3)
.map(function(item,index){

return (

(index+1)
+". "
+
item
+
" (오답 "
+
weakCategory[item]
+
"개)"

);

})
.join("<br>");



if(weakText===""){

weakText="분석 데이터 없음";

}



// 결과 출력


document.getElementById("reportBox")
.innerHTML =


`

<div style="
background:#f5f5f5;
padding:20px;
margin-top:20px;
border-radius:10px;
">


<h2>
📊 나의 학습 리포트
</h2>


<p>
총 응시 횟수 :
<b>${totalExam}회</b>
</p>


<p>
평균 정답률 :
<b>${avg}%</b>
</p>


<p>
최고 기록 :
<b>${maxScore}%</b>
</p>


<p>
합격률 :
<b>${passRate}%</b>
</p>



<hr>


<h3>
취약 분야 TOP 3
</h3>


<p>
${weakText}
</p>



<hr>


<h3>
추천 학습 방향
</h3>


<p>

${avg >= 80 ?

"현재 수준이 안정적입니다. 고난도 문제 풀이를 추천합니다."

:

"취약 분야 반복 학습 후 모의시험을 다시 진행하세요."

}

</p>


</div>

`;



};
// 관리자 메뉴 열기

document.getElementById("adminBtn")
.onclick=function(){

let password =
prompt("관리자 비밀번호 입력");


if(password === "1234"){

document.getElementById("adminMenu")
.style.display="block";


loadAdminQuestions();


}

else{

alert("관리자 권한 없음");

}

};



// 문제 저장

document.getElementById("saveQuestionBtn")
.onclick=function(){



let newQuestion={


question:

document.getElementById("adminQuestion").value,


choices:[

document.getElementById("choice1").value,

document.getElementById("choice2").value,

document.getElementById("choice3").value,

document.getElementById("choice4").value

],


answer:

Number(
document.getElementById("adminAnswer").value
),


explanation:

document.getElementById("adminExplain").value,


category:

document.getElementById("adminCategory").value,


year:

document.getElementById("adminPeriod").value,


level:

document.getElementById("adminLevel").value,


image:

document.getElementById("adminImage").value


};




let list =

JSON.parse(

localStorage.getItem("questions")

)

|| [];



list.push(newQuestion);



localStorage.setItem(

"questions",

JSON.stringify(list)

);



alert("문제 등록 완료");



loadAdminQuestions();


};




// 등록 문제 보기

function loadAdminQuestions(){


let list =

JSON.parse(

localStorage.getItem("questions")

)

|| [];



let html="";



list.forEach(function(q,index){



html += `


<div style="
border:1px solid #ccc;
padding:10px;
margin:10px;
">


${index+1}.
${q.question}


<button onclick="editQuestion('${doc.id}')">
수정
</button>

<button onclick="deleteQuestion(${index})">
삭제
</button>


</div>


`;



});



document.getElementById(
"questionList"
).innerHTML=html;



}



// 삭제

function deleteQuestion(index){


let list =

JSON.parse(

localStorage.getItem("questions")

)

|| [];



list.splice(index,1);



localStorage.setItem(

"questions",

JSON.stringify(list)

);



loadAdminQuestions();


}
document.getElementById("bookmarkListBtn").onclick = function(){

    const bookmarks =
    JSON.parse(localStorage.getItem("bookmarks")) || [];

    let html = "<h2>즐겨찾기 문제</h2>";

    if(bookmarks.length === 0){

        html += "<p>저장된 문제가 없습니다.</p>";

    }else{

        bookmarks.forEach(function(q, index){

            html += `
            <div style="border:1px solid #ccc;padding:10px;margin:10px;">

                <h3>${index+1}. ${q.question}</h3>

                <p>
                분야 : ${q.category}
                </p>

                <button onclick="startBookmarkQuiz(${index})">
                풀어보기
                </button>

            </div>
            `;

        });

    }

    document.getElementById("bookmarkList").innerHTML = html;

};
function startBookmarkQuiz(index){

    const bookmarks =
    JSON.parse(localStorage.getItem("bookmarks")) || [];

    quizList = [ bookmarks[index] ];

    currentQuestion = 0;

    score = 0;

    wrongAnswers = [];

    userAnswers = [null];

    mainMenu.style.display = "none";

    quizScreen.style.display = "block";

    showQuestion();
}

function editQuestion(id){

    db.collection("questions")
    .doc(id)
    .get()
    .then(function(doc){

        const q = doc.data();
        q.id = doc.id;

        document.getElementById("question").value = q.question;

        document.getElementById("choice1").value = q.choices[0];
        document.getElementById("choice2").value = q.choices[1];
        document.getElementById("choice3").value = q.choices[2];
        document.getElementById("choice4").value = q.choices[3];

        document.getElementById("answer").value = q.answer;

        document.getElementById("category").value = q.category;

        document.getElementById("level").value = q.level;

        document.getElementById("explanation").value = q.explanation;

        document.getElementById("image").value = q.image || "";

        window.editDocId = id;

    });

}

let list =
JSON.parse(localStorage.getItem("questions")) || [];

const newQuestion = {

    question:
    document.getElementById("question").value,

    choices:[

        document.getElementById("choice1").value,

        document.getElementById("choice2").value,

        document.getElementById("choice3").value,

        document.getElementById("choice4").value

    ],

    answer:Number(
        document.getElementById("answer").value
    ),

    category:
    document.getElementById("category").value,

    level:
    document.getElementById("level").value,

    explanation:
    document.getElementById("explanation").value,

    image:
    document.getElementById("image").value

};

if(window.editIndex !== undefined){

    list[window.editIndex] = newQuestion;

    window.editIndex = undefined;

}else{

    list.push(newQuestion);

}

localStorage.setItem(
    "questions",
    JSON.stringify(list)
);

alert("저장 완료");

loadAdminQuestions();

document.getElementById("question").value = "";

document.getElementById("choice1").value = "";

document.getElementById("choice2").value = "";

document.getElementById("choice3").value = "";

document.getElementById("choice4").value = "";

document.getElementById("answer").value = 0;

document.getElementById("category").selectedIndex = 0;

document.getElementById("level").selectedIndex = 0;

document.getElementById("explanation").value = "";

document.getElementById("image").value = "";

function saveQuestionResult(q, selected){


    if(!q.id){

        console.log(
            "문제 ID 없음",
            q
        );

        return;

    }


    db.collection("questionStats")
    .doc(q.id)
    .set({

        question:
        q.question,

        category:
        q.category || "",


        total:
        firebase.firestore.FieldValue.increment(1),


        correct:
        firebase.firestore.FieldValue.increment(
            selected === q.answer ? 1 : 0
        ),


        wrong:
        firebase.firestore.FieldValue.increment(
            selected === q.answer ? 0 : 1
        )


    },
    {
        merge:true
    });


}

function retryWrongQuestions(){


    if(wrongAnswers.length === 0){

        alert(
            "틀린 문제가 없습니다."
        );

        return;

    }


    quizList = wrongAnswers;


    currentQuestion = 0;

    score = 0;

    wrongAnswers = [];

    userAnswers =
    new Array(quizList.length)
    .fill(null);



    document.querySelector(".container")
    .innerHTML = `

    <h2 style="text-align:center">

    오답 재시험 시작

    </h2>

    `;


    document.getElementById("quizScreen")
    .style.display="block";


    showQuestion();


}

function saveQuestionStats(q,isCorrect){


    if(!q.id){

        return;

    }


    db.collection("questionStats")
    .doc(q.id)
    .set({

        question:
        q.question,

        category:
        q.category || "기타",

        total:
        firebase.firestore.FieldValue.increment(1),


        correct:
        firebase.firestore.FieldValue.increment(
            isCorrect ? 1 : 0
        ),


        wrong:
        firebase.firestore.FieldValue.increment(
            isCorrect ? 0 : 1
        )

    },
    {
        merge:true
    });


}

function saveCategoryStats(q, correct){


    const user =
    auth.currentUser;


    if(!user){

        return;

    }


    const category =
    q.category || "기타";


    const ref =

    db.collection("users")
    .doc(user.uid)
    .collection("categoryStats")
    .doc(category);



    ref.set({

        category:

        category,


        total:

        firebase.firestore.FieldValue.increment(1),


        correct:

        firebase.firestore.FieldValue.increment(
            correct ? 1 : 0
        ),


        wrong:

        firebase.firestore.FieldValue.increment(
            correct ? 0 : 1
        )


    },
    {
        merge:true
    });


}

