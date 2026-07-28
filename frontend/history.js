// =====================================
// AI 한국사
// history.js
// =====================================

// ------------------------------
// 전역 변수
// ------------------------------

let historyList = [];

let scoreChart = null;
let rateChart = null;
let categoryChart = null;

// ------------------------------
// 초기화
// ------------------------------

function initHistory() {

    const btn = document.getElementById("myHistoryBtn");

    if (btn) {

        btn.addEventListener(
            "click",
            loadHistory
        );

    }

}

// ------------------------------
// 시험기록 불러오기
// ------------------------------

async function loadHistory() {

    const user = auth.currentUser;

    if (!user) {

        alert("로그인이 필요합니다.");

        return;

    }

    try {

        const snapshot = await db

            .collection("users")

            .doc(user.uid)

            .collection("quizHistory")

            .orderBy("created", "desc")

            .limit(20)

            .get();

        historyList = [];

        snapshot.forEach(function (doc) {

            const item = doc.data();

            item.id = doc.id;

            historyList.push(item);

        });

        renderHistory();

        updateHistoryStatistics();

        drawHistoryCharts();

    } catch (e) {

        console.error(e);

        alert("시험기록을 불러오지 못했습니다.");

    }

}

function renderHistory() {

    const area =
        document.getElementById("myHistory");

    if (!area) return;

    if (historyList.length === 0) {

        area.innerHTML =

        `
        <h3>시험 기록</h3>

        <p>
        시험 기록이 없습니다.
        </p>
        `;

        return;

    }

    let html =

    `
    <h3>최근 시험</h3>
    `;

    historyList.forEach(function(item,index){

        const date =

            item.created
            ?

            item.created
                .toDate()
                .toLocaleString()

            :

            "-";

        html +=

        `
        <div class="questionBox">

            <h4>

            ${index+1}회차

            </h4>

            <p>

            점수 :

            ${item.score}/${item.total}

            </p>

            <p>

            정답률 :

            ${item.percent}%

            </p>

            <p>

            오답 :

            ${item.wrongCount}

            </p>

            <p>

            날짜 :

            ${date}

            </p>

            <button

                onclick="deleteHistory('${item.id}')"

            >

            삭제

            </button>

        </div>

        `;

    });

    area.innerHTML = html;

}

async function deleteHistory(id){

    const user = auth.currentUser;

    if(!user) return;

    const ok = confirm(

        "시험기록을 삭제하시겠습니까?"

    );

    if(!ok) return;

    try{

        await db

        .collection("users")

        .doc(user.uid)

        .collection("quizHistory")

        .doc(id)

        .delete();

        loadHistory();

    }

    catch(e){

        console.error(e);

        alert(e.message);

    }

}

// =====================================
// 시험 통계 계산
// =====================================

function updateHistoryStatistics(){

    const area =
    document.getElementById("historyStatistics");


    if(!area) return;


    if(historyList.length===0){

        area.innerHTML="";

        return;

    }


    let totalExam =
        historyList.length;


    let totalQuestion = 0;

    let totalCorrect = 0;

    let totalWrong = 0;

    let totalPercent = 0;


    let maxScore = 0;

    let minScore = 100;



    historyList.forEach(function(item){


        totalQuestion +=
            item.total || 0;



        totalCorrect +=
            item.score || 0;



        totalWrong +=
            item.wrongCount || 0;



        totalPercent +=
            item.percent || 0;



        if(
            item.percent > maxScore
        ){

            maxScore =
                item.percent;

        }



        if(
            item.percent < minScore
        ){

            minScore =
                item.percent;

        }


    });



    const avgPercent =

        Math.round(
            totalPercent / totalExam
        );



    area.innerHTML =


    `

    <h3>
    📊 나의 학습 통계
    </h3>


    <div class="dashboard">


        <div class="card">

            <h3>
            ${totalExam}
            </h3>

            <p>
            총 응시
            </p>

        </div>



        <div class="card">

            <h3>
            ${avgPercent}%
            </h3>

            <p>
            평균 정답률
            </p>

        </div>



        <div class="card">

            <h3>
            ${maxScore}%
            </h3>

            <p>
            최고 기록
            </p>

        </div>



        <div class="card">

            <h3>
            ${totalWrong}
            </h3>

            <p>
            총 오답
            </p>

        </div>


    </div>



    <p>
    누적 풀이 :
    ${totalQuestion} 문제
    </p>


    <p>
    누적 정답 :
    ${totalCorrect} 문제
    </p>



    <p>
    최저 기록 :
    ${minScore}%
    </p>


    `;


}

// =====================================
// 시험 기록 그래프
// =====================================

function drawHistoryCharts(){

    if(historyList.length===0){

        return;

    }


    drawScoreChart();

    drawCorrectWrongChart();

    drawCategoryChart();

}



// =====================================
// 점수 변화 그래프
// =====================================

function drawScoreChart(){


    const canvas =

    document.getElementById(
        "scoreChart"
    );


    if(!canvas) return;



    if(scoreChart){

        scoreChart.destroy();

    }



    const labels = [];

    const data = [];



    historyList
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



    scoreChart = new Chart(

        canvas,

        {

        type:"line",


        data:{


            labels:labels,


            datasets:[{


                label:

                "정답률 (%)",


                data:data,


                borderColor:"#2196F3",


                backgroundColor:

                "rgba(33,150,243,0.2)",


                tension:0.3


            }]

        },


        options:{


            responsive:true,


            scales:{


                y:{


                    beginAtZero:true,


                    max:100


                }


            }


        }


    });

}




// =====================================
// 정답/오답 비율
// =====================================

function drawCorrectWrongChart(){



    const canvas =

    document.getElementById(
        "correctWrongChart"
    );



    if(!canvas) return;



    if(rateChart){

        rateChart.destroy();

    }



    let correct=0;

    let wrong=0;



    historyList.forEach(function(item){


        correct +=

        item.score || 0;



        wrong +=

        item.wrongCount || 0;



    });



    rateChart = new Chart(

        canvas,

        {


        type:"doughnut",


        data:{


            labels:[

                "정답",

                "오답"

            ],


            datasets:[{


                data:[

                    correct,

                    wrong

                ],


                backgroundColor:[

                    "#4CAF50",

                    "#F44336"

                ]


            }]


        },


        options:{


            responsive:true


        }



    });



}





// =====================================
// 분야별 정답률
// =====================================

function drawCategoryChart(){


    const canvas =

    document.getElementById(
        "categoryChart"
    );


    if(!canvas) return;



    if(categoryChart){

        categoryChart.destroy();

    }



    const category={};



    historyList.forEach(function(item){


        const key =

        item.category || "전체";


        if(!category[key]){


            category[key]={

                total:0,

                score:0

            };


        }



        category[key].total +=

        item.total || 0;



        category[key].score +=

        item.score || 0;



    });




    const labels =

    Object.keys(category);



    const data =

    labels.map(function(key){


        return Math.round(

            category[key].score /

            category[key].total *

            100

        );


    });





    categoryChart = new Chart(

        canvas,

        {


        type:"bar",


        data:{


            labels:labels,


            datasets:[{


                label:

                "분야별 정답률",


                data:data,


                backgroundColor:

                "#FF9800"


            }]


        },


        options:{


            responsive:true,


            scales:{


                y:{


                    beginAtZero:true,


                    max:100


                }


            }


        }



    });


}

// =====================================
// History 시작
// =====================================

document.addEventListener(
"DOMContentLoaded",
function(){

    console.log("history 초기화");

    initHistory();

});