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
const selectAllBtn =
    document.getElementById(
        "selectAllBtn"
    );

if(selectAllBtn){

    selectAllBtn.onclick =
        selectAllQuestions;

}


const bulkApproveBtn =
    document.getElementById(
        "bulkApproveBtn"
    );

if(bulkApproveBtn){

    bulkApproveBtn.onclick =
        bulkApproveQuestions;

}


const bulkDeleteBtn =
    document.getElementById(
        "bulkDeleteBtn"
    );

if(bulkDeleteBtn){

    bulkDeleteBtn.onclick =
        bulkDeleteQuestions;

}
const templateBtn =
    document.getElementById(
        "downloadTemplateBtn"
    );

if(templateBtn){

    templateBtn.onclick =
        downloadCSVTemplate;

}

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


const aiAnalysisBtn =
document.getElementById(
"aiAnalysisBtn"
);

if(aiAnalysisBtn){

    aiAnalysisBtn.onclick =
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


const aiGenerateBtn =
document.getElementById(
"aiGenerateBtn"
);


if(aiGenerateBtn){

aiGenerateBtn.onclick =
generateAIQuestion;

}
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

    try{

        // ----------------------------
        // 문제 데이터
        // ----------------------------

        const keywordValue =
            getValue("keywords");


        const data = {

            // 기본 문제
            question:
                getValue("question"),


            choices: [

                getValue("choice1"),

                getValue("choice2"),

                getValue("choice3"),

                getValue("choice4"),
                getValue("choice5"),

            ],


            answer:
                Number(
                    getValue("answer")
                ),


            // 분류
            period:
                getValue("period"),


            category:
                getValue("category"),


            level:
                getValue("level"),


            type:
                getValue("type"),


            // 출처
            source:
                getValue("source"),


            sourceType:
                getValue("sourceType"),


            sourceYear:
                getValue("sourceYear"),


            reference:
                getValue("reference"),


            // 키워드
            keywords:
                keywordValue
                ? keywordValue
                    .split(",")
                    .map(function(item){

                        return item.trim();

                    })
                    .filter(function(item){

                        return item !== "";

                    })
                : [],


            // 해설
            explanation:
                getValue("explanation"),


            // 이미지
            image:
                getValue("image"),


            // 추가 학습 정보
            concept:
                getValue("concept"),


            wrongPoint:
                getValue("wrongPoint"),


            memory:
                getValue("memory"),


            // 문제 품질
            qualityScore:
                0,


            approved:
                false,


            // 통계
            solveCount:
                0,


            correctCount:
                0,


            wrongCount:
                0,


            // 생성일
            created:
                firebase.firestore.FieldValue.serverTimestamp(),


            updated:
                firebase.firestore.FieldValue.serverTimestamp()

        };


        // ----------------------------
        // 필수값 검사
        // ----------------------------

        if(!data.question){

            alert(
                "문제를 입력해주세요."
            );

            return;

        }


        if(
    !data.choices ||
    data.choices.length !== 5 ||
    data.choices.some(function(choice){
        return !choice.trim();
    })
){

    alert(
        "보기 5개를 모두 입력해주세요."
    );

    return;

}

            alert(
                "보기 4개를 입력해주세요."
            );

            return;

        }


        // ----------------------------
        // 중복 문제 검사
        // ----------------------------

        const duplicate =
            await checkDuplicateQuestion(
                data.question
            );


        if(
            duplicate &&
            duplicate !== editingId
        ){

            alert(
                "이미 등록된 문제입니다."
            );

            return;

        }


        // ----------------------------
        // 수정
        // ----------------------------

        if(editingId){

            await db

                .collection("questions")

                .doc(editingId)

                .update(data);


            alert(
                "문제가 수정되었습니다."
            );

        }


        // ----------------------------
        // 신규 등록
        // ----------------------------

        else{

            await db

                .collection("questions")

                .add(data);


            alert(
                "문제가 등록되었습니다."
            );

        }


        // ----------------------------
        // 초기화
        // ----------------------------

        editingId = null;


        clearForm();


        await loadQuestions();


    }

    catch(e){

        console.error(
            "문제 저장 오류:",
            e
        );


        alert(
            "저장 오류 : "
            +
            e.message
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



        buildQuestionFilters();

        currentPage = 1;

        renderFilteredPage(questionCache);



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

    let html = "";


    // --------------------------------
    // 문제 목록 생성
    // --------------------------------

    list.forEach(function(q){

        html += `

        <div class="questionBox">


            <h3>
                ${q.question || ""}
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


            <p>
                출처 :
                ${q.sourceType || ""}
                ${q.sourceYear || ""}
            </p>


            <p>
                상태 :
                ${
                    q.approved
                    ? "✅ 승인"
                    : "⚠ 검토"
                }
            </p>


           <div class="question-actions">

    <label>

        <input
            type="checkbox"
            class="question-check"
            value="${q.id}"
        >

        선택

    </label>


    <button
        onclick="editQuestion('${q.id}')"
    >
        수정
    </button>


    <button
        onclick="deleteQuestion('${q.id}')"
    >
        삭제
    </button>


    ${
        q.approved

        ?

        `<span class="approved-badge">
            ✅ 승인
        </span>`

        :

        `<button
            onclick="approveQuestion('${q.id}')"
        >
            승인
        </button>`
    }

</div>


        </div>

        `;

    });


    // --------------------------------
    // 화면 출력
    // --------------------------------

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
        getValue("searchQuestion")
        .trim()
        .toLowerCase();

    const year =
        document.getElementById("filterYear")?.value
        || "전체";

    const reference =
        document.getElementById("filterReference")?.value
        || "전체";

    const period =
        document.getElementById("filterPeriod")?.value
        || "전체";

    const category =
        document.getElementById("filterCategory")?.value
        || "전체";

    const level =
        document.getElementById("filterLevel")?.value
        || "전체";

    const approved =
        document.getElementById("filterApproved")?.value
        || "전체";


    const result =
        questionCache.filter(function(q){

            const question =
                (q.question || "")
                .toLowerCase();


            const matchKeyword =
                keyword === ""
                ||
                question.includes(keyword);


            const matchYear =
                year === "전체"
                ||
                String(q.sourceYear || "") === year;


            const matchReference =
                reference === "전체"
                ||
                String(q.reference || "") === reference;


            const matchPeriod =
                period === "전체"
                ||
                q.period === period;


            const matchCategory =
                category === "전체"
                ||
                q.category === category;


            const matchLevel =
                level === "전체"
                ||
                q.level === level;


            const matchApproved =
                approved === "전체"

                ||

                (
                    approved === "승인"
                    &&
                    q.approved === true
                )

                ||

                (
                    approved === "검토"
                    &&
                    q.approved !== true
                );


            return (
                matchKeyword &&
                matchYear &&
                matchReference &&
                matchPeriod &&
                matchCategory &&
                matchLevel &&
                matchApproved
            );

        });


    currentPage = 1;

    renderFilteredPage(result);

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
// CSV 문제 일괄 업로드 V2
// ========================================

async function uploadCSV(){

    const file =
        document.getElementById("csvFile")?.files[0];

    if(!file){

        alert("CSV 파일을 선택하세요.");
        return;

    }

    Papa.parse(file, {

        header:true,

        skipEmptyLines:true,

        encoding:"UTF-8",

        complete: async function(result){

            try{

                const rows = result.data;

                if(!rows.length){

                    alert("CSV에 문제가 없습니다.");
                    return;

                }


                // --------------------------------
                // 기존 문제 가져오기
                // --------------------------------

                await db.collection(
    "questions"
)
.add({

    question:
        row.question || "",


    choices: [

        row.choice1 || "",

        row.choice2 || "",

        row.choice3 || "",

        row.choice4 || "",
        row.choice5 || ""
    ],


    answer:
        Number(row.answer) - 1,


    period:
        row.period || "기타",


    category:
        row.category || "기타",


    level:
        row.level || "중",


    type:
        row.type || "기출",


    source:
        row.source || "",


    sourceType:
        row.sourceType ||
        "한국사능력검정 기출",


    sourceYear:
        row.sourceYear || "",


    reference:
        row.reference || "",


    keywords:

        row.keywords

        ?

        row.keywords
            .split(",")
            .map(function(item){

                return item.trim();

            })
            .filter(function(item){

                return item !== "";

            })

        :

        [],


    explanation:
        row.explanation || "",


    concept:
        row.concept || "",


    wrongPoint:
        row.wrongPoint || "",


    memory:
        row.memory || "",


    image:
        row.image || "",


    // ==========================
    // 승인 관리
    // ==========================

    approved:
        false,


    qualityScore:
        0,


    solveCount:
        0,


    correctCount:
        0,


    wrongCount:
        0,


    created:
        firebase.firestore
        .FieldValue
        .serverTimestamp(),


    updated:
        firebase.firestore
        .FieldValue
        .serverTimestamp()

});


                let success = 0;
                let duplicate = 0;
                let errorCount = 0;


                // --------------------------------
                // 진행 표시
                // --------------------------------

                const progressBox =
                    document.getElementById(
                        "uploadProgress"
                    );

                const uploadBar =
                    document.getElementById(
                        "uploadBar"
                    );

                const uploadText =
                    document.getElementById(
                        "uploadText"
                    );


                if(progressBox){

                    progressBox.style.display =
                        "block";

                }


                // --------------------------------
                // 문제 등록
                // --------------------------------

                for(let i=0; i<rows.length; i++){

                    const row = rows[i];


                    try{

                        const question =
                            (row.question || "").trim();


                        // 문제 없는 행 제외
                        if(!question){

                            errorCount++;
                            continue;

                        }


                        // --------------------------------
                        // 중복 검사
                        // --------------------------------

                        if(existing.has(question)){

                            duplicate++;

                            continue;

                        }


                        // --------------------------------
                        // 키워드
                        // --------------------------------

                        const keywords =
                            row.keywords

                            ?

                            row.keywords
                                .split(",")
                                .map(function(item){

                                    return item.trim();

                                })
                                .filter(function(item){

                                    return item !== "";

                                })

                            :

                            [];


                        // --------------------------------
                        // 정답
                        // CSV는 1~4
                        // Firebase는 0~3
                        // --------------------------------

                        let answer =
                            Number(row.answer);


                        if(answer >= 1 && answer <= 4){

                            answer--;

                        }


                        // --------------------------------
                        // Firebase 데이터
                        // --------------------------------

                        const data = {

                            question:
                                question,


                            choices:[

                                row.choice1 || "",

                                row.choice2 || "",

                                row.choice3 || "",

                                row.choice4 || "",
                                row.choice5 || ""

                            ],


                            answer:
                                answer,


                            period:
                                row.period || "기타",


                            category:
                                row.category || "기타",


                            level:
                                row.level || "중",


                            type:
                                row.type || "기출",


                            source:
                                row.source || "",


                            sourceType:
                                row.sourceType ||
                                "한국사능력검정 기출",


                            sourceYear:
                                row.sourceYear || "",


                            reference:
                                row.reference || "",


                            keywords:
                                keywords,


                            explanation:
                                row.explanation || "",


                            concept:
                                row.concept || "",


                            wrongPoint:
                                row.wrongPoint || "",


                            memory:
                                row.memory || "",


                            image:
                                row.image || "",


                            // 문제 품질
                            qualityScore:
                                0,


                            approved:
                                false,


                            // 통계
                            solveCount:
                                0,


                            correctCount:
                                0,


                            wrongCount:
                                0,


                            created:
                                firebase.firestore
                                .FieldValue
                                .serverTimestamp(),


                            updated:
                                firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                        };


                        // --------------------------------
                        // 보기 검사
                        // --------------------------------

                        if(

                            !data.choices[0] ||
                            !data.choices[1] ||
                            !data.choices[2] ||
                            !data.choices[3]

                        ){

                            errorCount++;

                            continue;

                        }


                        // --------------------------------
                        // 저장
                        // --------------------------------

                        await db
                            .collection("questions")
                            .add(data);


                        existing.add(question);

                        success++;


                        // --------------------------------
                        // 진행률
                        // --------------------------------

                        const percent =
                            Math.round(
                                ((i + 1) / rows.length) *
                                100
                            );


                        if(uploadBar){

                            uploadBar.value =
                                percent;

                        }


                        if(uploadText){

                            uploadText.innerText =
                                `업로드 중... ${i + 1} / ${rows.length}`;

                        }


                    }

                    catch(e){

                        console.error(
                            "행 처리 오류:",
                            i + 1,
                            e
                        );

                        errorCount++;

                    }

                }


                // --------------------------------
                // 완료
                // --------------------------------

                if(uploadText){

                    uploadText.innerText =
                        "업로드 완료";

                }


                alert(

`CSV 업로드 완료

전체 : ${rows.length}문제

신규 등록 : ${success}문제

중복 제외 : ${duplicate}문제

오류 제외 : ${errorCount}문제`

                );


                await loadQuestions();


            }

            catch(e){

                console.error(
                    "CSV 업로드 오류:",
                    e
                );


                alert(
                    "CSV 업로드 오류 : " +
                    e.message
                );

            }

        },

        error:function(error){

            console.error(error);

            alert(
                "CSV 파일을 읽을 수 없습니다."
            );

        }

    });

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

            choice5:
            q.choices?.[4] || "",

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

// ===========================================
// AI 문제 생성
// ===========================================


async function generateAIQuestion(){


const keyword =

getValue(
"aiKeyword"
);



const level =

getValue(
"aiLevel"
);



if(!keyword){

alert(
"키워드를 입력하세요."
);

return;

}



const result = {


question:

keyword+
"에 대한 설명으로 옳은 것은?",



choices:[

"정답 보기 예시",

"오답 보기 1",

"오답 보기 2",

"오답 보기 3"

],


answer:0,


period:"조선",


category:"문화",


level:level,


type:"AI생성",


explanation:

keyword+
"와 관련된 역사적 사실을 이해하는 것이 중요합니다.",


keywords:[keyword]


};



document.getElementById(
"aiResult"
)
.innerHTML=

`

<h3>
AI 생성 결과
</h3>


<p>
${result.question}
</p>


<p>
① ${result.choices[0]}
</p>


<p>
② ${result.choices[1]}
</p>


<p>
③ ${result.choices[2]}
</p>


<p>
④ ${result.choices[3]}
</p>


<button onclick='saveAIQuestion(${JSON.stringify(result)})'>

문제은행 저장

</button>


`;



}

async function saveAIQuestion(q){


await db.collection(
"questions"
)
.add({

...q,

created:

firebase.firestore.FieldValue.serverTimestamp()

});


alert(
"문제은행 저장 완료"
);



loadQuestions();


}
// ===========================================
// 문제 중복 검사
// ===========================================

async function checkDuplicateQuestion(question){


const snapshot =

await db.collection(
"questions"
)
.where(
"question",
"==",
question
)
.get();



return !snapshot.empty;


}
async function approveQuestion(id){


await db.collection(
"questions"
)
.doc(id)
.update({

approved:true,

qualityScore:100


});


alert(
"문제가 승인되었습니다."
);


loadQuestions();


}
async function analyzeSource(){


const snap =

await db.collection(
"questions"
)
.get();


let result={};



snap.forEach(function(doc){


const q =
doc.data();


const s =
q.sourceType || "없음";


result[s]=
(result[s]||0)+1;


});



console.log(result);


}
async function createAIQuestion(){


const topic =
getValue("aiTopic");


const period =
getValue("aiPeriod");


const level =
getValue("aiLevel");



const questionData = {


question:

topic+
"에 대한 설명으로 옳은 것은?",


choices:[

topic+
"과 관련된 올바른 설명",

"잘못된 설명 1",

"잘못된 설명 2",

"잘못된 설명 3"

],


answer:0,


period:period,


category:"정치",


level:level,


type:"AI생성",


explanation:

topic+
"의 역사적 의미를 이해하는 문제입니다.",


status:"pending",


created:

firebase.firestore
.FieldValue
.serverTimestamp()


};



await db.collection(
"aiGeneratedQuestions"
)
.add(questionData);



alert(
"AI 문제 생성 완료\n관리자 검토 필요"
);


loadAIQuestions();


}
async function approveAIQuestion(id){


const doc =

await db.collection(
"aiGeneratedQuestions"
)
.doc(id)
.get();



const q =
doc.data();



await db.collection(
"questions"
)
.add({

...q,


approved:true,


sourceType:"AI생성"


});



await db.collection(
"aiGeneratedQuestions"
)
.doc(id)
.update({

status:"approved"

});


alert(
"문제은행 등록 완료"
);


}
async function autoTagQuestion(){


const question =

getValue(
"question"
);



if(!question){

alert(
"문제를 입력하세요"
);

return;

}



let tag={};



if(question.includes("세종")
||
question.includes("훈민정음")){


tag={

period:"조선",

category:"문화",

theme:"문자",

keyword:[
"세종",
"훈민정음"
]

};


}


else if(
question.includes("고려")
){


tag={

period:"고려",

category:"정치",

theme:"왕권"

};


}


else{


tag={

period:"분석 필요",

category:"분석 필요"

};


}



document.getElementById(
"tagResult"
)
.innerHTML=

`

<h3>
AI 분석 결과
</h3>

<p>
시대 : ${tag.period}
</p>

<p>
분야 : ${tag.category}
</p>

<p>
주제 : ${tag.theme || ""}

</p>

`;

}
// ========================================
// CSV 등록 양식 다운로드
// ========================================

function downloadCSVTemplate(){

    const headers = [

        "question",
        "choice1",
        "choice2",
        "choice3",
        "choice4",
        "choice5",
        "answer",
        "period",
        "category",
        "level",
        "type",
        "source",
        "sourceType",
        "sourceYear",
        "reference",
        "keywords",
        "explanation",
        "concept",
        "wrongPoint",
        "memory",
        "image"

    ];


    const example = {

        question:
            "여기에 문제를 입력하세요.",

        choice1:
            "보기 1",

        choice2:
            "보기 2",

        choice3:
            "보기 3",

        choice4:
            "보기 4",
        choice5:
            "보기 5",
        answer:
            "1",

        period:
            "조선",

        category:
            "정치",

        level:
            "중",

        type:
            "기출",

        source:
            "한국사능력검정시험",

        sourceType:
            "한국사능력검정 기출",

        sourceYear:
            "2020",

        reference:
            "회차 입력",

        keywords:
            "키워드1,키워드2",

        explanation:
            "문제 해설",

        concept:
            "핵심 개념",

        wrongPoint:
            "오답 포인트",

        memory:
            "암기법",

        image:
            ""

    };


    const csv =
        Papa.unparse({

            fields: headers,

            data: [

                headers.map(function(header){

                    return example[header] || "";

                })

            ]

        });


    const BOM = "\uFEFF";


    const blob =
        new Blob(

            [BOM + csv],

            {
                type:
                    "text/csv;charset=utf-8;"
            }

        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    a.href = url;


    a.download =
        "AI한국사_문제등록_양식.csv";


    document.body.appendChild(a);


    a.click();


    document.body.removeChild(a);


    URL.revokeObjectURL(url);


    alert(
        "CSV 등록 양식을 다운로드했습니다.\n\n" +
        "엑셀에서 문제를 작성한 후\n" +
        "관리자 → CSV 관리 → CSV 업로드를 이용하세요."
    );

}
function renderFilteredPage(list){

    const start =
        (currentPage - 1) * pageSize;

    const end =
        start + pageSize;

    renderQuestionList(
        list.slice(start, end)
    );


    const pageInfo =
        document.getElementById("pageInfo");


    const maxPage =
        Math.max(
            1,
            Math.ceil(list.length / pageSize)
        );


    if(pageInfo){

        pageInfo.innerText =
            `${currentPage} / ${maxPage}`;

    }


    const prev =
        document.getElementById("prevPageBtn");

    const next =
        document.getElementById("nextPageBtn");


    if(prev){

        prev.disabled =
            currentPage <= 1;

    }


    if(next){

        next.disabled =
            currentPage >= maxPage;

    }

}
function buildQuestionFilters(){

    const yearSet = new Set();
    const referenceSet = new Set();
    const periodSet = new Set();


    questionCache.forEach(function(q){

        if(q.sourceYear){

            yearSet.add(
                String(q.sourceYear)
            );

        }

        if(q.reference){

            referenceSet.add(
                String(q.reference)
            );

        }

        if(q.period){

            periodSet.add(
                String(q.period)
            );

        }

    });


    fillSelect(
        "filterYear",
        Array.from(yearSet).sort()
    );


    fillSelect(
        "filterReference",
        Array.from(referenceSet).sort()
    );


    fillSelect(
        "filterPeriod",
        Array.from(periodSet)
    );

}
function fillSelect(id, values){

    const select =
        document.getElementById(id);

    if(!select) return;


    const firstOption =
        select.options[0];

    select.innerHTML = "";


    if(firstOption){

        select.appendChild(
            firstOption
        );

    }


    values.forEach(function(value){

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = value;

        select.appendChild(option);

    });

}
// ========================================
// 선택 문제 일괄 승인
// ========================================

async function bulkApproveQuestions(){

    const checked =
        document.querySelectorAll(
            ".question-check:checked"
        );


    if(checked.length === 0){

        alert(
            "승인할 문제를 선택하세요."
        );

        return;

    }


    if(
        !confirm(
            `${checked.length}개 문제를 승인하시겠습니까?`
        )
    ){

        return;

    }


    try{

        const batch =
            db.batch();


        checked.forEach(function(box){

            const ref =
                db.collection("questions")
                .doc(box.value);


            batch.update(ref, {

                approved: true,

                qualityScore: 100,

                updated:
                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()

            });

        });


        await batch.commit();


        alert(
            `${checked.length}개 문제가 승인되었습니다.`
        );


        await loadQuestions();

    }

    catch(e){

        console.error(
            "일괄 승인 오류:",
            e
        );


        alert(
            "일괄 승인 오류 : " +
            e.message
        );

    }

}
// ========================================
// 선택 문제 일괄 삭제
// ========================================

async function bulkDeleteQuestions(){

    const checked =
        document.querySelectorAll(
            ".question-check:checked"
        );


    if(checked.length === 0){

        alert(
            "삭제할 문제를 선택하세요."
        );

        return;

    }


    if(
        !confirm(
            `${checked.length}개 문제를 삭제하시겠습니까?\n\n삭제 후 복구할 수 없습니다.`
        )
    ){

        return;

    }


    try{

        const batch =
            db.batch();


        checked.forEach(function(box){

            const ref =
                db.collection("questions")
                .doc(box.value);


            batch.delete(ref);

        });


        await batch.commit();


        alert(
            `${checked.length}개 문제가 삭제되었습니다.`
        );


        await loadQuestions();

    }

    catch(e){

        console.error(
            "일괄 삭제 오류:",
            e
        );


        alert(
            "일괄 삭제 오류 : " +
            e.message
        );

    }

}
// ========================================
// 현재 목록 전체 선택
// ========================================

function selectAllQuestions(){

    const boxes =
        document.querySelectorAll(
            ".question-check"
        );


    if(boxes.length === 0){

        alert(
            "현재 표시된 문제가 없습니다."
        );

        return;

    }


    const allChecked =
        Array.from(boxes)
        .every(function(box){

            return box.checked;

        });


    boxes.forEach(function(box){

        box.checked =
            !allChecked;

    });

}