// console.log(db);

let quizList = [];
let currentQuestion = 0;
let score = 0;
let wrongAnswers = [];
const mainMenu =
document.getElementById("mainMenu");

const quizScreen =
document.getElementById("quizScreen");


// 기본 문제 + 관리자 추가 문제 합치기

function getAllQuestions(){

    const savedQuestions =
    JSON.parse(
        localStorage.getItem("questions")
    ) || [];


    return [
        ...questions,
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
.onclick=function(){


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



    quizList = getAllQuestions().filter(function(q){


        let result=true;



        if(period !== "전체"){

            result =
            result &&
            q.year === period;

        }



        if(category !== "전체"){

            result =
            result &&
            q.category === category;

        }



        if(level !== "전체"){

            result =
            result &&
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



    showQuestion();


};



// 문제 표시
function showQuestion(){

    const q = quizList[currentQuestion];


    document.getElementById("progress").innerText =
    `문제 ${currentQuestion + 1} / ${quizList.length}`;


    document.getElementById("question").innerText =
    q.question;


    document.getElementById("questionImage").src =
    q.image;



    const choiceBox =
    document.getElementById("choices");


    choiceBox.innerHTML="";



    q.choices.forEach(function(choice,index){


        const button =
        document.createElement("button");


        button.innerText =
        `${index+1}. ${choice}`;



        button.onclick=function(){

            checkAnswer(index);

        };


        choiceBox.appendChild(button);


    });



    document.getElementById("result").innerHTML="";


    document.getElementById("nextBtn").style.display="none";



    let percent =
    ((currentQuestion) / quizList.length) * 100;


    document.getElementById("progressBar").style.width =
    percent + "%";

}



// 정답 확인
function checkAnswer(selected){


    const q = quizList[currentQuestion];


    if(selected === q.answer){


        score++;


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


        wrongAnswers.push(q);


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

}



// 다음 문제
document.getElementById("nextBtn").onclick=function(){


    currentQuestion++;



    if(currentQuestion < quizList.length){


        showQuestion();


    }

    else{


        saveResult();

        showResult();


    }


};



// 결과 저장
function saveResult(){


    localStorage.setItem(

        "wrongAnswers",

        JSON.stringify(wrongAnswers)

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

        quizList.length

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

                question:
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


}

    localStorage.setItem(

        "quizHistory",

        JSON.stringify(history)

    );


    // Firebase 시험 기록 저장

db.collection("quizHistory")
.add({

    date:
    new Date().toLocaleString(),

    score:
    score,

    total:
    quizList.length,

    wrongCount:
    wrongAnswers.length

})
.then(function(){

    console.log(
    "Firebase 저장 완료"
    );

})
.catch(function(error){

    console.log(
    "저장 오류",
    error
    );

});


}



// 결과 화면
function showResult(){


    const percent =

    Math.round(

        score / quizList.length * 100

    );



    let resultText =
    percent >= 80
    ? "합격"
    : "불합격";



    document.querySelector(".container").innerHTML =

    `

    <h1>
    시험 종료
    </h1>


    <h2>
    ${score} / ${quizList.length}
    </h2>


    <h2>
    ${resultText}
    </h2>


    <p>
    정답률 : ${percent}%
    </p>


    <button onclick="location.reload()">
    다시 시작
    </button>

    <button onclick="shareQuiz()">
카카오톡 공유
</button>

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



// 분야별 문제(다음 버전)
// 분야별 메뉴 열기

document.getElementById("categoryBtn").onclick=function(){

    document.getElementById("categoryMenu").style.display="block";

};




// 분야별 시험 시작

document.querySelectorAll(".category")
.forEach(function(button){


    button.onclick=function(){


        const category =
        this.dataset.category;



        document.getElementById("mainMenu").style.display="none";

        document.getElementById("quizScreen").style.display="block";



        quizList = getAllQuestions().filter(function(q){

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