// ========================================
// AI 한국사 관리자 V2 FINAL
// admin.js Part 1/4
// ========================================


// ================================
// 전역 변수
// ================================

let questionCache = [];

let currentPage = 1;

let pageSize = 10;

let editingId = null;


// Chart 변수

let periodChart = null;

let categoryChart = null;



console.log(
    "AI 한국사 관리자 FINAL 시작"
);



// ================================
// DOM 시작
// ================================


document.addEventListener(
"DOMContentLoaded",
function(){


    initAdmin();


});




// ================================
// 관리자 초기화
// ================================


function initAdmin(){


    const qualityBtn =
document.getElementById(
"qualityBtn"
);

if(qualityBtn){

qualityBtn.onclick =
loadQualityAnalysis;

}


const improveBtn =
document.getElementById(
"improveBtn"
);

if(improveBtn){

improveBtn.onclick =
loadImprovementSuggestions;

}


const aiBtn =
document.getElementById(
"aiAnalysisBtn"
);

if(aiBtn){

aiBtn.onclick =
loadAIQuestionAnalysis;

}
    const loginBtn =
    document.getElementById(
        "adminLoginBtn"
    );


    if(loginBtn){

        loginBtn.onclick =
        adminLogin;

    }




    const saveBtn =
    document.getElementById(
        "saveBtn"
    );


    if(saveBtn){

        saveBtn.onclick =
        saveQuestion;

    }




    const searchBtn =
    document.getElementById(
        "searchBtn"
    );


    if(searchBtn){

        searchBtn.onclick =
        searchQuestions;

    }





    const resetBtn =
    document.getElementById(
        "resetBtn"
    );


    if(resetBtn){

        resetBtn.onclick =
        loadQuestions;

    }




    const periodBtn =
    document.getElementById(
        "periodAnalysisBtn"
    );


    if(periodBtn){

        periodBtn.onclick =
        loadPeriodAnalysis;

    }





    const analysisBtn =
    document.getElementById(
        "analysisBtn"
    );


    if(analysisBtn){

        analysisBtn.onclick =
        loadQualityAnalysis;

    }




    const uploadBtn =
    document.getElementById(
        "uploadCsvBtn"
    );


    if(uploadBtn){

        uploadBtn.onclick =
        uploadCSV;

    }




    const downloadBtn =
    document.getElementById(
        "downloadCsvBtn"
    );


    if(downloadBtn){

        downloadBtn.onclick =
        downloadCSV;

    }




    checkLogin();



}





// ================================
// 로그인 상태 확인
// ================================


function checkLogin(){


    auth.onAuthStateChanged(

    function(user){


        if(user){

            showAdmin();

        }


    });


}





// ================================
// 관리자 로그인
// ================================


async function adminLogin(){


    const email =
    getValue(
        "adminEmail"
    );


    const password =
    getValue(
        "adminPassword"
    );



    try{


        await auth
        .signInWithEmailAndPassword(

            email,

            password

        );



        showAdmin();


    }


    catch(e){


        alert(
            "로그인 실패 : "
            +
            e.message
        );


    }


}





// ================================
// 관리자 화면 표시
// ================================


function showAdmin(){



    const loginArea =
    document.getElementById(
        "loginArea"
    );


    const adminArea =
    document.getElementById(
        "adminArea"
    );



    if(loginArea){

        loginArea.style.display =
        "none";

    }



    if(adminArea){

        adminArea.style.display =
        "block";

    }




    loadDashboard();


    loadQuestions();


}






// ================================
// 로그아웃
// ================================


function logout(){


    auth.signOut();


    location.reload();


}






// ================================
// Dashboard
// ================================


async function loadDashboard(){


try{


    const questionSnap =
    await db.collection(
        "questions"
    )
    .get();



    setText(
        "totalQuestion",
        questionSnap.size
    );




    const userSnap =
    await db.collection(
        "users"
    )
    .get();




    setText(
        "totalUser",
        userSnap.size
    );




    let examCount = 0;

    let wrongCount = 0;

    let totalScore = 0;

    let totalExam = 0;




    for(
        const user
        of userSnap.docs
    ){


        const historySnap =

        await db.collection(
            "users"
        )
        .doc(
            user.id
        )
        .collection(
            "quizHistory"
        )
        .get();




        historySnap.forEach(function(doc){


            const data =
            doc.data();



            examCount++;


            wrongCount +=
            data.wrongCount || 0;



            totalScore +=
            data.percent || 0;



            totalExam++;



        });



    }




    setText(
        "totalExam",
        examCount
    );



    setText(
        "totalWrong",
        wrongCount
    );



    const avg =

    totalExam > 0

    ?

    Math.round(
        totalScore /
        totalExam
    )

    :

    0;



    setText(
        "avgScore",
        avg+"%"
    );



    loadDashboardCharts();



}


catch(e){


    console.error(
        "Dashboard 오류",
        e
    );


}


}

// ========================================
// AI 한국사 관리자 V2 FINAL
// admin.js Part 2/4
// 문제 CRUD
// ========================================


// ================================
// 문제 저장
// ================================


async function saveQuestion(){


    const data = {


        question:
        getValue("question"),


        choices:[

            getValue("choice1"),

            getValue("choice2"),

            getValue("choice3"),

            getValue("choice4")

        ],


        answer:
        Number(
            getValue("answer")
        ),


        period:
        getValue("period"),


        category:
        getValue("category"),


        level:
        getValue("level"),


        type:
        getValue("type"),


        source:
        getValue("source"),


        keywords:

        getValue("keywords")

        ?

        getValue("keywords")
        .split(",")

        :

        [],



        explanation:
        getValue("explanation"),


        image:
        getValue("image")

    };




    try{


        if(editingId){


            await db.collection(
                "questions"
            )
            .doc(editingId)
            .update(data);



            alert(
                "문제가 수정되었습니다."
            );


        }


        else{


            data.created =
            firebase.firestore
            .FieldValue
            .serverTimestamp();



            await db.collection(
                "questions"
            )
            .add(data);



            alert(
                "문제가 등록되었습니다."
            );


        }




        clearForm();


        loadQuestions();


    }


    catch(e){


        console.error(e);


        alert(
            "저장 오류 : "
            + e.message
        );


    }


}






// ================================
// 문제 불러오기
// ================================


async function loadQuestions(){


    try{


        const snapshot =

        await db.collection(
            "questions"
        )
        .get();



        questionCache=[];



        snapshot.forEach(function(doc){


            const q =
            doc.data();



            q.id =
            doc.id;



            questionCache.push(q);



        });



        renderQuestionList(
            questionCache
        );



    }


    catch(e){


        console.error(
            e
        );


    }


}






// ================================
// 문제 목록 출력
// ================================


function renderQuestionList(list){



    let html="";



    list.forEach(function(q){



        html += `

<div class="questionBox">


<h3>
${q.question}
</h3>


<p>
시대 :
${q.period || ""}
</p>


<p>
분야 :
${q.category || ""}
</p>


<p>
난이도 :
${q.level || ""}
</p>


<p>
유형 :
${q.type || ""}
</p>



<button onclick="editQuestion('${q.id}')">

수정

</button>



<button onclick="deleteQuestion('${q.id}')">

삭제

</button>


</div>

`;



    });




    const area =
    document.getElementById(
        "questionList"
    );



    if(area){

        area.innerHTML =
        html;

    }


}






// ================================
// 검색
// ================================


function searchQuestions(){



    const keyword =

    getValue(
        "searchQuestion"
    )
    .toLowerCase();



    const category =

    document.getElementById(
        "filterCategory"
    )
    ?.value || "전체";



    const level =

    document.getElementById(
        "filterLevel"
    )
    ?.value || "전체";





    const result =

    questionCache.filter(function(q){



        const matchKeyword =


        keyword === ""

        ||

        q.question
        .toLowerCase()
        .includes(keyword);



        const matchCategory =


        category === "전체"

        ||

        q.category === category;



        const matchLevel =


        level === "전체"

        ||

        q.level === level;



        return (

            matchKeyword

            &&

            matchCategory

            &&

            matchLevel

        );


    });




    renderQuestionList(
        result
    );


}






// ================================
// 문제 수정
// ================================


function editQuestion(id){



    const q =

    questionCache.find(function(item){


        return item.id === id;


    });




    if(!q)return;




    editingId=id;



    setValue(
        "question",
        q.question
    );



    if(q.choices){


        q.choices.forEach(
        function(c,i){


            setValue(
                "choice"+(i+1),
                c
            );


        });


    }



    setValue(
        "answer",
        q.answer
    );


    setValue(
        "period",
        q.period
    );


    setValue(
        "category",
        q.category
    );


    setValue(
        "level",
        q.level
    );


    setValue(
        "type",
        q.type
    );


    setValue(
        "source",
        q.source
    );


    setValue(
        "keywords",
        q.keywords
        ?
        q.keywords.join(",")
        :
        ""
    );


    setValue(
        "explanation",
        q.explanation
    );


    setValue(
        "image",
        q.image
    );



    window.scrollTo(
        {
            top:0,
            behavior:"smooth"
        }
    );


}






// ================================
// 문제 삭제
// ================================


async function deleteQuestion(id){


    if(
        !confirm(
        "삭제하시겠습니까?"
        )
    ){

        return;

    }



    await db.collection(
        "questions"
    )
    .doc(id)
    .delete();



    alert(
        "삭제되었습니다."
    );


    loadQuestions();


}






// ================================
// 입력 초기화
// ================================


function clearForm(){



    editingId=null;



    document.querySelectorAll(
        "input,textarea"
    )
    .forEach(function(el){


        if(
        el.id !== "searchQuestion"
        ){

            el.value="";

        }


    });



}

// ========================================
// AI 한국사 관리자 V2 FINAL
// admin.js Part 3/4
// 통계 / CSV / 분석
// ========================================


// ================================
// Dashboard Chart
// ================================


async function loadDashboardCharts(){


    const snapshot =

    await db.collection(
        "questions"
    )
    .get();



    const period={};

    const category={};



    snapshot.forEach(function(doc){


        const q =
        doc.data();



        const p =
        q.period || "기타";



        const c =
        q.category || "기타";



        period[p] =
        (period[p] || 0)+1;



        category[c] =
        (category[c] || 0)+1;



    });



    drawPeriodChart(
        period
    );


    drawCategoryChart(
        category
    );


}





// ================================
// 시대별 차트
// ================================


function drawPeriodChart(data){


    const canvas =
    document.getElementById(
        "periodChart"
    );



    if(!canvas)return;



    if(periodChart){

        periodChart.destroy();

    }




    periodChart =

    new Chart(

        canvas,

        {

        type:"pie",


        data:{


            labels:
            Object.keys(data),



            datasets:[{

                data:
                Object.values(data),


                backgroundColor:[

                    "#2563eb",
                    "#16a34a",
                    "#f59e0b",
                    "#dc2626",
                    "#9333ea",
                    "#0891b2"

                ]

            }]


        }


        }

    );


}






// ================================
// 분야별 차트
// ================================


function drawCategoryChart(data){



    const canvas =
    document.getElementById(
        "categoryChart"
    );



    if(!canvas)return;



    if(categoryChart){

        categoryChart.destroy();

    }




    categoryChart =

    new Chart(

        canvas,

        {


        type:"bar",


        data:{


            labels:
            Object.keys(data),


            datasets:[{


                label:
                "문제 수",


                data:
                Object.values(data),


                backgroundColor:
                "#2563eb"


            }]


        },


        options:{


            responsive:true


        }


        }

    );


}






// ========================================
// CSV 업로드
// ========================================


async function uploadCSV(){



    const file =

    document.getElementById(
        "csvFile"
    )
    ?.files[0];



    if(!file){


        alert(
            "CSV 파일을 선택하세요."
        );


        return;

    }



    Papa.parse(

        file,

        {


        header:true,


        skipEmptyLines:true,



        complete:
        async function(result){



            const rows =
            result.data;



            let success=0;

            let duplicate=0;



            const snapshot =
            await db.collection(
                "questions"
            )
            .get();



            const existing =
            new Set();



            snapshot.forEach(function(doc){


                existing.add(
                    doc.data().question
                );


            });





            for(
                const row
                of rows
            ){



                if(
                    existing.has(
                    row.question
                    )
                ){


                    duplicate++;

                    continue;


                }




                await db.collection(
                    "questions"
                )
                .add({



                    question:
                    row.question,



                    choices:[

                        row.choice1,

                        row.choice2,

                        row.choice3,

                        row.choice4

                    ],



                    answer:

                    Number(
                        row.answer
                    )-1,



                    period:
                    row.period || "기타",



                    category:
                    row.category || "기타",



                    level:
                    row.level || "중",



                    type:
                    row.type || "예상",




                    source:
                    row.source || "",



                    keywords:

                    row.keywords

                    ?

                    row.keywords.split(",")

                    :

                    [],




                    explanation:
                    row.explanation || "",



                    image:
                    row.image || "",



                    created:

                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()


                });




                existing.add(
                    row.question
                );


                success++;



            }




            alert(

`
CSV 업로드 완료

신규 등록 : ${success}

중복 제외 : ${duplicate}
`

            );



            loadQuestions();



        }


        }

    );


}






// ========================================
// CSV 다운로드
// ========================================


async function downloadCSV(){



    const snapshot =

    await db.collection(
        "questions"
    )
    .get();



    let data=[];



    snapshot.forEach(function(doc){


        const q =
        doc.data();



        data.push({


            question:
            q.question,


            choice1:
            q.choices?.[0] || "",


            choice2:
            q.choices?.[1] || "",


            choice3:
            q.choices?.[2] || "",


            choice4:
            q.choices?.[3] || "",



            answer:
            (q.answer || 0)+1,



            period:
            q.period || "",



            category:
            q.category || "",



            level:
            q.level || "",



            type:
            q.type || "",



            source:
            q.source || "",



            keywords:
            q.keywords
            ?
            q.keywords.join(",")
            :
            "",



            explanation:
            q.explanation || ""


        });



    });





    const csv =
    Papa.unparse(data);




    const blob =
    new Blob(

        [csv],

        {
            type:
            "text/csv;charset=utf-8;"
        }

    );



    const url =
    URL.createObjectURL(blob);



    const a =
    document.createElement(
        "a"
    );



    a.href=url;


    a.download =
    "AI한국사_문제은행.csv";



    a.click();


}






// ========================================
// 시대별 오답 분석
// ========================================


async function loadPeriodAnalysis(){



    const snapshot =

    await db.collection(
        "questionStats"
    )
    .get();




    let result={};




    snapshot.forEach(function(doc){



        const q =
        doc.data();



        const period =
        q.period || "기타";




        if(!result[period]){


            result[period]={

                total:0,

                wrong:0

            };


        }




        result[period].total +=
        q.total || 0;



        result[period].wrong +=
        q.wrong || 0;




    });





    let html =

    "<h3>시대별 오답률</h3>";





    Object.keys(result)
    .forEach(function(key){



        const rate =

        result[key].total > 0

        ?

        Math.round(

            result[key].wrong /

            result[key].total *

            100

        )

        :

        0;




        html +=

        `

        <p>

        ${key} :

        ${rate}%

        </p>

        `;



    });





    const area =
    document.getElementById(
        "analysisResult"
    );



    if(area){

        area.innerHTML =
        html;

    }


}

// ========================================
// AI 한국사 관리자 V2 FINAL
// admin.js Part 4/4
// 분석 / AI / 공통함수
// ========================================



// ================================
// 문제 품질 분석
// ================================


async function loadQualityAnalysis(){


    const snapshot =

    await db.collection(
        "questionStats"
    )
    .get();



    let html =
    "<h3>문제 품질 분석</h3>";



    let count=0;



    snapshot.forEach(function(doc){


        const q =
        doc.data();



        const wrongRate =

        q.total > 0

        ?

        Math.round(

            q.wrong /

            q.total *

            100

        )

        :

        0;




        if(wrongRate >= 70){



            count++;



            html += `


<div class="questionBox">


<h3>
⚠️ ${q.question || "문제"}
</h3>


<p>
오답률 :
${wrongRate}%
</p>


<p>
분야 :
${q.category || ""}
</p>


</div>


`;



        }



    });





    if(count===0){


        html +=

        "<p>분석 대상 문제가 없습니다.</p>";


    }




    const area =

    document.getElementById(
        "qualityAnalysis"
    );



    if(area){

        area.innerHTML =
        html;

    }


}







// ================================
// AI 문제 개선 추천
// ================================


function loadImprovementSuggestions(){



    const area =

    document.getElementById(
        "improvementResult"
    );



    if(area){


        area.innerHTML =


`

<h3>
AI 문제 개선 의견
</h3>


<p>
1. 오답률 70% 이상 문제는 해설 보강 필요
</p>


<p>
2. 보기 선택지 난이도 균형 검토 필요
</p>


<p>
3. 사료형 문제 비율 확대 권장
</p>


<p>
4. 특정 시대 편중 여부 확인 필요
</p>


`;



    }


}






// ================================
// AI 출제 분석
// ================================


function loadAIQuestionAnalysis(){



    const area =

    document.getElementById(
        "aiQuestionAnalysis"
    );



    if(area){



        area.innerHTML =



`

<h3>
AI 출제 방향 분석
</h3>


<ul>


<li>
조선 정치·사회 분야 강화 필요
</li>


<li>
문화·사료 분석 문제 확대 권장
</li>


<li>
한국사능력검정시험 최신 유형 반영 필요
</li>


<li>
고난도 자료 분석 문제 확보 필요
</li>


</ul>


`;



    }



}







// ================================
// 공통 함수
// ================================



function getValue(id){


    const el =

    document.getElementById(id);



    return el

    ?

    el.value

    :

    "";

}




function setValue(id,value){



    const el =

    document.getElementById(id);



    if(el){

        el.value =
        value || "";

    }



}





function setText(id,value){



    const el =

    document.getElementById(id);



    if(el){

        el.innerText =
        value;

    }


}





function clearForm(){



    editingId=null;



    const inputs =

    document.querySelectorAll(

        "input, textarea"

    );



    inputs.forEach(function(el){



        if(

            el.id !==
            "searchQuestion"

        ){

            el.value="";

        }



    });



}





// ================================
// 페이지 기능
// ================================



function renderPage(){


    const start =

    (currentPage-1)
    *
    pageSize;



    const end =

    start + pageSize;



    const list =

    questionCache.slice(
        start,
        end
    );



    renderQuestionList(
        list
    );



    const pageInfo =

    document.getElementById(
        "pageInfo"
    );



    if(pageInfo){


        pageInfo.innerText =


        `

        ${currentPage}
        /
        ${Math.ceil(
            questionCache.length /
            pageSize
        )}

        `;


    }


}






// ================================
// 페이지 버튼 연결
// ================================



document.addEventListener(
"DOMContentLoaded",
function(){



    const prev =

    document.getElementById(
        "prevPageBtn"
    );



    const next =

    document.getElementById(
        "nextPageBtn"
    );




    if(prev){


        prev.onclick=function(){



            if(currentPage>1){


                currentPage--;


                renderPage();


            }


        };


    }





    if(next){


        next.onclick=function(){



            const max =

            Math.ceil(

                questionCache.length /

                pageSize

            );



            if(currentPage < max){


                currentPage++;


                renderPage();


            }


        };


    }



});

// ================================
// 페이지 전환
// ================================

function showPage(id){


    const pages =
    document.querySelectorAll(
        ".page"
    );


    pages.forEach(function(page){

        page.style.display =
        "none";

    });



    const target =
    document.getElementById(id);



    if(target){

        target.style.display =
        "block";

    }


}