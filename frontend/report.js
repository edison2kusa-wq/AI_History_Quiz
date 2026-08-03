// =====================================
// AI 한국사
// report.js
// =====================================


// 리포트 데이터

let reportHistory = [];




// =====================================
// 학습 리포트 실행
// =====================================

async function loadReport(){


    const user = auth.currentUser;


    if(!user){


        alert(
            "로그인이 필요합니다."
        );


        return;

    }



    try{


        const snapshot =

        await db

        .collection("users")

        .doc(user.uid)

        .collection("quizHistory")

        .orderBy(
            "created",
            "desc"
        )

        .get();



        reportHistory=[];



        snapshot.forEach(function(doc){


            const data =
            doc.data();


            data.id =
            doc.id;


            reportHistory.push(data);


        });



        renderReport();



    }


    catch(e){


        console.error(e);


        alert(
            "리포트를 불러오지 못했습니다."
        );


    }


}
// =====================================
// 리포트 표시
// =====================================

function renderReport(){


    const box =

    document.getElementById(
        "reportBox"
    );



    if(!box) return;



    if(reportHistory.length===0){


        box.innerHTML=

        `

        <h3>
        📊 학습 리포트
        </h3>

        <p>
        시험 기록이 없습니다.
        </p>

        `;
        
        return;

    }




    let total=0;

    let score=0;

    let wrong=0;



    reportHistory.forEach(function(item){


        total +=

        item.total || 0;


        score +=

        item.score || 0;


        wrong +=

        item.wrongCount || 0;


    });




    const avg =

    Math.round(

        score /

        total *

        100

    );




    box.innerHTML=

    `

    <h2>
    📊 AI 한국사 학습 리포트
    </h2>



    <div class="dashboard">


        <div class="card">

        <h3>
        ${reportHistory.length}
        </h3>

        <p>
        응시 횟수
        </p>

        </div>



        <div class="card">

        <h3>
        ${avg}%
        </h3>

        <p>
        평균 정답률
        </p>

        </div>



        <div class="card">

        <h3>
        ${total}
        </h3>

        <p>
        총 풀이 문제
        </p>

        </div>



        <div class="card">

        <h3>
        ${wrong}
        </h3>

        <p>
        총 오답
        </p>

        </div>



    </div>


    `;

    drawReportCharts();
}

// =====================================
// 시대별 분석
// =====================================

function analyzePeriod(){


    const result = {};



    reportHistory.forEach(function(item){


        const period =

        item.period || "전체";



        if(!result[period]){


            result[period]={

                total:0,

                score:0

            };


        }



        result[period].total +=

        item.total || 0;



        result[period].score +=

        item.score || 0;



    });



    Object.keys(result)

    .forEach(function(key){


        result[key].percent =

        Math.round(

            result[key].score /

            result[key].total *

            100

        );


    });



    return result;


}





// =====================================
// 분야별 분석
// =====================================

function analyzeCategory(){


    const result = {};



    reportHistory.forEach(function(item){



        const category =

        item.category || "전체";



        if(!result[category]){


            result[category]={

                total:0,

                score:0

            };


        }



        result[category].total +=

        item.total || 0;



        result[category].score +=

        item.score || 0;



    });




    Object.keys(result)

    .forEach(function(key){


        result[key].percent =

        Math.round(

            result[key].score /

            result[key].total *

            100

        );


    });



    return result;


}





// =====================================
// 취약 분야 분석
// =====================================

function getWeakArea(){


    const category =

    analyzeCategory();



    const list =

    Object.keys(category)

    .map(function(key){


        return {


            name:key,


            score:
            category[key].percent


        };


    });



    list.sort(function(a,b){


        return a.score-b.score;


    });



    return list.slice(0,3);


}

// =====================================
// 리포트 차트 생성
// =====================================

let reportScoreChart = null;

let periodChart = null;

let categoryReportChart = null;



function drawReportCharts(){


    drawScoreTrend();


    drawPeriodChart();


    drawCategoryReportChart();


}



// =====================================
// 점수 변화 그래프
// =====================================

function drawScoreTrend(){


    const canvas =

    document.getElementById(
        "scoreChart"
    );



    if(!canvas) return;



    if(reportScoreChart){

        reportScoreChart.destroy();

    }



    const labels=[];

    const data=[];



    reportHistory

    .slice()

    .reverse()

    .forEach(function(item,index){



        labels.push(

            (index+1)+"회"

        );


        data.push(

            item.percent || 0

        );


    });





    reportScoreChart =

    new Chart(

        canvas,

        {


        type:"line",


        data:{


            labels:labels,


            datasets:[{


                label:

                "시험 정답률",


                data:data,


                borderColor:

                "#3F51B5",


                backgroundColor:

                "rgba(63,81,181,0.2)",


                tension:0.3


            }]


        },


        options:{


            responsive:true,


            scales:{


                y:{


                    min:0,


                    max:100


                }


            }


        }


    });


}




// =====================================
// 시대별 차트
// =====================================

function drawPeriodChart(){


    const canvas =

    document.getElementById(
       "correctWrongChart"
    );



    if(!canvas) return;



    if(periodChart){

        periodChart.destroy();

    }



    const data =
    analyzePeriod();



    periodChart =

    new Chart(

        canvas,

        {


        type:"bar",


        data:{


            labels:

            Object.keys(data),



            datasets:[{


                label:

                "시대별 정답률",


                data:

                Object.values(data)

                .map(function(v){

                    return v.percent;

                }),



                backgroundColor:

                "#4CAF50"


            }]


        },


        options:{


            responsive:true,


            scales:{


                y:{


                    min:0,


                    max:100


                }


            }


        }


    });


}






// =====================================
// 분야별 차트
// =====================================

function drawCategoryReportChart(){


    const canvas =

    document.getElementById(
        "categoryChart"
    );



    if(!canvas) return;



    if(categoryReportChart){

        categoryReportChart.destroy();

    }



    const data =

    analyzeCategory();



    categoryReportChart =

    new Chart(

        canvas,

        {


        type:"bar",


        data:{


            labels:

            Object.keys(data),



            datasets:[{


                label:

                "분야별 정답률",


                data:

                Object.values(data)

                .map(function(v){

                    return v.percent;

                }),



                backgroundColor:

                "#FF9800"


            }]


        },


        options:{


            responsive:true,


            scales:{


                y:{


                    min:0,


                    max:100


                }


            }


        }


    });


}

// =====================================
// Report 초기화
// =====================================

document.addEventListener(
"DOMContentLoaded",
function(){

    console.log("report 초기화");


    const btn =
    document.getElementById(
        "reportBtn"
    );


    if(btn){

        btn.onclick =
        loadReport;

    }


});

// =====================================
// AI 학습 코칭 리포트
// =====================================

function createAICoachingReport(){


    const total =
    quizList.length;


    if(total===0){

        return null;

    }


    const accuracy =

    Math.round(

        score /
        total *
        100

    );



    let level = "";

    let message = "";



    if(accuracy >= 90){

        level = "최상급";

        message =
        "고난도 사료 분석과 기출 심화 학습을 추천합니다.";

    }

    else if(accuracy >= 75){

        level = "상급";

        message =
        "기본 개념은 안정적이며 취약 시대 반복이 필요합니다.";

    }

    else if(accuracy >= 60){

        level = "중급";

        message =
        "시대별 핵심 개념 정리가 필요합니다.";

    }

    else{

        level = "기초";

        message =
        "기본 용어와 흐름 학습부터 권장합니다.";

    }



    const category = {};



    quizList.forEach(function(q,index){


        const c =
        q.category || "기타";


        if(!category[c]){

            category[c]={
                total:0,
                correct:0
            };

        }


        category[c].total++;


        if(userAnswers[index]===q.answer){

            category[c].correct++;

        }


    });



    let weak = null;

    let weakRate = 100;



    Object.keys(category)
    .forEach(function(key){


        const rate =

        category[key].correct /
        category[key].total *
        100;


        if(rate < weakRate){

            weakRate = rate;

            weak = key;

        }


    });



    return {

        level:level,

        accuracy:accuracy,

        message:message,

        weak:weak,

        weakRate:
        Math.round(weakRate)

    };


}