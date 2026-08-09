// =====================================
// AI 한국사 심화 퀴즈
// app.js
// =====================================


// =====================================
// 페이지 시작
// =====================================

window.onload=function(){


    console.log(
        "AI 한국사 app.js 시작"
    );



    initButtons();



};




// =====================================
// 버튼 연결
// =====================================

function initButtons(){



    // -----------------------
    // 시험 시작
    // -----------------------

    const startBtn =
document.getElementById("startBtn");

if(startBtn){

    startBtn.onclick = function(){

        openExamSetting();

    };

}




    // -----------------------
    // 설정 후 시험 시작
    // -----------------------

    const settingStartBtn =

    document.getElementById(
        "settingStartBtn"
    );


    if(settingStartBtn){


        settingStartBtn.onclick=function(){


            startNormalQuiz();


        };


    }





    // -----------------------
    // 시험 기록
    // -----------------------

    const historyBtn =

    document.getElementById(
        "historyBtn"
    );


    if(historyBtn){


        historyBtn.onclick=function(){

            loadHistory();

        };


    }





    // -----------------------
    // 나의 시험 기록
    // -----------------------

    const myHistoryBtn =

    document.getElementById(
        "myHistoryBtn"
    );


    if(myHistoryBtn){


        myHistoryBtn.onclick=function(){

            loadHistory();

        };


    }





    // -----------------------
    // 오답노트
    // -----------------------

    const wrongBtn =

    document.getElementById(
        "wrongNoteBtn"
    );


    if(wrongBtn){


        wrongBtn.onclick=function(){

            loadWrongNote();

        };


    }





    // -----------------------
    // 오답 다시 풀기
    // -----------------------

    const wrongQuizBtn =

    document.getElementById(
        "wrongQuizBtn"
    );


    if(wrongQuizBtn){


        wrongQuizBtn.onclick=function(){


            retryAllWrong();


        };


    }





    // -----------------------
    // 즐겨찾기 목록
    // -----------------------

    const bookmarkListBtn =

    document.getElementById(
        "bookmarkListBtn"
    );


    if(bookmarkListBtn){


        bookmarkListBtn.onclick=function(){


            loadBookmarks();


        };


    }
    // -----------------------
    // AI 추천 시험
    // -----------------------

    const aiBtn =

    document.getElementById(
        "aiRecommendBtn"
    );


    if(aiBtn){


        aiBtn.onclick=function(){


            startAIRecommend();


        };


    }





    // -----------------------
    // 학습 리포트
    // -----------------------

    const reportBtn =

    document.getElementById(
        "reportBtn"
    );


    if(reportBtn){


        reportBtn.onclick=function(){


            loadReport();


        };


    }





    // -----------------------
    // 취약 분야 분석
    // -----------------------

    const weakBtn =

    document.getElementById(
        "weakBtn"
    );


    if(weakBtn){


        weakBtn.onclick=function(){


            showWeakAnalysis();


        };


    }





    // -----------------------
    // 즐겨찾기 버튼
    // 퀴즈 화면
    // -----------------------

    initBookmark();





    // -----------------------
    // 관리자 페이지
    // -----------------------

    const adminBtn =

    document.getElementById(
        "adminBtn"
    );


    if(adminBtn){


        adminBtn.onclick=function(){


            location.href =
            "admin/admin.html";


        };


    }


}

// =====================================
// 취약 분야 표시
// =====================================

function showWeakAnalysis(){


    const area =

    document.getElementById(
        "weakAnalysis"
    );


    if(!area) return;



    if(typeof getWeakArea !== "function"){


        area.innerHTML =

        "분석 데이터가 없습니다.";


        return;

    }



    const weak =
    getWeakArea();



    let html =

    `

    <h3>
    📈 취약 분야 분석
    </h3>

    `;



    weak.forEach(function(item,index){


        html +=


        `

        <p>

        ${index+1}위

        ${item.name}

        :

        ${item.score}%

        </p>

        `;


    });



    area.innerHTML=html;


}

// =====================================
// 일반 시험 시작
// =====================================

async function startNormalQuiz(){


    let allQuestions = [];


    try{


        const snapshot =

        await db

        .collection("questions")

        .get();



        snapshot.forEach(function(doc){


            const q =
            doc.data();


            q.id =
            doc.id;


            allQuestions.push(q);


        });



    }

    catch(e){


        console.error(e);


        alert(
            "문제를 불러오지 못했습니다."
        );


        return;

    }





    // 선택값

    const period =

    document.getElementById(
        "periodSelect"
    ).value;



    const category =

    document.getElementById(
        "categorySelect"
    ).value;



    const level =

    document.getElementById(
        "levelSelect"
    ).value;



    const count =

    Number(

    document.getElementById(
        "countSelect"
    ).value

    );





    // 필터 적용

    let filtered =

    allQuestions.filter(function(q){



        let ok=true;



        if(
            period !== "전체" &&
            q.period !== period
        ){

            ok=false;

        }



        if(
            category !== "전체" &&
            q.category !== category
        ){

            ok=false;

        }



        if(
            level !== "전체" &&
            q.level !== level
        ){

            ok=false;

        }



        return ok;


    });





    // 문제 부족하면 전체 사용

    if(filtered.length < count){


        filtered =
        allQuestions;


    }




    shuffleArray(filtered);



    quizList =

    filtered.slice(
        0,
        count
    );



    currentQuestion=0;


    score=0;


    wrongAnswers=[];





    // 화면 이동

    appScreen("quizScreen");

    showQuestion();


}

// =====================================
// 모바일 앱 화면 전환
// =====================================

function showAppScreen(screenId) {

    const mainMenu = document.getElementById("mainMenu");
    const quizScreen = document.getElementById("quizScreen");

    if (mainMenu) {
        mainMenu.style.display = "none";
    }

    if (quizScreen) {
        quizScreen.style.display = "none";
    }

    const target = document.getElementById(screenId);

    if (target) {
        target.style.display = "block";
    }

    window.scrollTo(0, 0);
}


// =====================================
// 메인 화면으로 돌아가기
// =====================================

function showMainMenu() {

    const mainMenu = document.getElementById("mainMenu");
    const quizScreen = document.getElementById("quizScreen");

    if (quizScreen) {
        quizScreen.style.display = "none";
    }

    if (mainMenu) {
        mainMenu.style.display = "block";
    }

    window.scrollTo(0, 0);
}
// =====================================
// 모바일 앱 화면 관리
// =====================================

// =====================================
// 모바일 앱 화면 전환 V2
// =====================================

function appScreen(screenId) {

    const screens = [

        "mainMenu",
        "settingMenu",
        "categoryMenu",
        "quizScreen",
        "reportBox",
        "weakAnalysis",
        "myHistory",
        "bookmarkList",
        "wrongNote",
        "aiResultBox"

    ];


    // 모든 화면 숨김

    screens.forEach(function(id){

        const el =
            document.getElementById(id);

        if(el){

            el.style.display = "none";

        }

    });


    // 선택 화면 표시

    const target =
        document.getElementById(screenId);


    if(target){

        target.style.display = "block";

    }


    // =================================
    // 하단 네비게이션 처리
    // =================================

    const bottomNav =
        document.getElementById("bottomNav");


    if(bottomNav){

        if(screenId === "quizScreen"){

            // 문제 풀이 중에는 숨김

            bottomNav.style.display = "none";

        }
        else{

            // 일반 화면에서는 표시

            bottomNav.style.display = "flex";

        }

    }


    // =================================
    // 화면에 따라 활성 메뉴
    // =================================

    if(screenId === "mainMenu"){

        setActiveNav(0);

    }

    else if(
        screenId === "settingMenu" ||
        screenId === "categoryMenu"
    ){

        setActiveNav(1);

    }

    else if(
        screenId === "myHistory" ||
        screenId === "reportBox" ||
        screenId === "weakAnalysis"
    ){

        setActiveNav(2);

    }


    // 화면 최상단

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

// =====================================
// 홈으로 이동
// =====================================

function goHome() {

    appScreen("mainMenu");

}


// =====================================
// 시험 설정 화면
// =====================================

function openExamSetting() {

    appScreen("settingMenu");

}


// =====================================
// 분야 선택 화면
// =====================================

function openCategoryMenu() {

    appScreen("categoryMenu");

}
// =====================================
// 하단 네비게이션
// =====================================

function setActiveNav(index) {

    const items =
        document.querySelectorAll(".nav-item");

    items.forEach(function(item, i) {

        item.classList.toggle(
            "active",
            i === index
        );

    });

}


// =====================================
// 홈
// =====================================

function goHome() {

    appScreen("mainMenu");

    setActiveNav(0);

}


// =====================================
// 학습
// =====================================

function openExamSetting() {

    appScreen("settingMenu");

    setActiveNav(1);

}


// =====================================
// 기록
// =====================================

function openHistoryScreen() {

    appScreen("myHistory");

    setActiveNav(2);

}


// =====================================
// 설정
// =====================================

function openSettingsScreen() {

    goHome();

    const loginBox =
        document.getElementById("loginBox");

    if(loginBox){

        loginBox.scrollIntoView({
            behavior:"smooth",
            block:"start"
        });

    }

    setActiveNav(3);

}