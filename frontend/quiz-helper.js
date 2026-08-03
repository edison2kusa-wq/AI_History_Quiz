// ===========================================
// AI 한국사 퀴즈 Helper
// quiz-helper.js
// ===========================================


// ----------------------------
// ID 단축 함수
// ----------------------------

function $(id){

    return document.getElementById(id);

}



// ----------------------------
// 보이기
// ----------------------------

function show(id){

    const el=$(id);


    if(el){

        el.style.display="block";

    }

}



// ----------------------------
// 숨기기
// ----------------------------

function hide(id){

    const el=$(id);


    if(el){

        el.style.display="none";

    }

}




// ----------------------------
// 랜덤 섞기
// ----------------------------

function shuffle(array){


    return array.sort(
        function(){

            return Math.random()-0.5;

        }
    );


}




// ----------------------------
// 시간 표시
// ----------------------------

function secondToText(sec){


    if(sec < 0){

        sec=0;

    }



    const min =
    Math.floor(sec / 60);



    const second =
    sec % 60;



    return (

        String(min)
        .padStart(2,"0")

        +

        ":"

        +

        String(second)
        .padStart(2,"0")

    );


}




// ----------------------------
// AI 학습 코칭
// ----------------------------

function createAICoachingReport(){



    if(!quizList ||
       quizList.length===0){

        return null;

    }



    const accuracy =

    Math.round(

        score /

        quizList.length *

        100

    );



    let level="";

    let message="";



    if(accuracy>=90){


        level="최상위권";


        message=

        "심화 사료 분석과 고난도 문제 풀이를 추천합니다.";


    }


    else if(accuracy>=70){


        level="상위권";


        message=

        "취약 시대 중심의 반복 학습이 필요합니다.";


    }


    else if(accuracy>=50){


        level="중위권";


        message=

        "기본 개념과 시대 흐름 정리가 필요합니다.";


    }


    else{


        level="기초 단계";


        message=

        "한국사 전체 흐름 학습부터 시작하는 것을 추천합니다.";


    }




    let category={};



    wrongAnswers.forEach(function(q){


        let c =
        q.category || "기타";


        category[c] =
        (category[c] || 0)+1;


    });



    let weak="";

    let weakRate=0;



    Object.keys(category)
    .forEach(function(key){


        if(category[key]>weakRate){


            weak=key;

            weakRate=category[key];

        }


    });



    return {


        level:level,


        accuracy:accuracy,


        message:message,


        weak:weak,


        weakRate:weakRate


    };


}





// ----------------------------
// AI 결과 표시
// ----------------------------

function showAIResult(){


    const box =
    $("reportBox");



    if(!box)return;



    const report =
    createAICoachingReport();



    if(!report)return;




    box.innerHTML +=


    `

    <div class="questionBox">


    <h3>
    🤖 AI 학습 분석
    </h3>


    <p>
    학습 단계 :
    <b>
    ${report.level}
    </b>
    </p>


    <p>
    추천 :
    ${report.message}
    </p>


    </div>

    `;



}