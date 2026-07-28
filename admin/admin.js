// ===============================
// AI 한국사 관리자
// admin.js
// ===============================

// 전역 변수
let currentPage = 1;
const pageSize = 20;

let questionCache = [];
let editDocId = null;

// 페이지가 열리면 실행
window.onload = function () {

    console.log("admin.js 로드 완료");

    document.getElementById("adminLoginBtn").onclick = adminLogin;
    document.getElementById("saveBtn").onclick = saveQuestion;
    document.getElementById("searchBtn").onclick = searchQuestions;
    document.getElementById("resetBtn").onclick = resetSearch;
    document.getElementById("uploadCsvBtn").onclick = uploadCSV;
    document.getElementById("downloadCsvBtn").onclick = downloadCSV;
    document.getElementById("prevPageBtn").onclick=function(){

    if(currentPage>1){

        currentPage--;

        renderPage();

    }

};


document.getElementById("nextPageBtn").onclick=function(){

    const totalPage =
    Math.ceil(
        questionCache.length/pageSize
    );


    if(currentPage<totalPage){

        currentPage++;

        renderPage();

    }

};
};

async function adminLogin() {

    const email =
        document.getElementById("adminEmail").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    if (email === "" || password === "") {

        alert("이메일과 비밀번호를 입력하세요.");

        return;
    }

    try {

        await auth.signInWithEmailAndPassword(
            email,
            password
        );

        document.getElementById("loginArea").style.display = "none";
document.getElementById("adminArea").style.display = "block";

await loadQuestions();
await loadDashboard();
await loadStatistics();

alert("관리자 로그인 성공");

    } catch (e) {

        console.error(e);

        alert("로그인 실패\n\n" + e.message);

    }

}

async function loadQuestions() {

    const snapshot = await db.collection("questions").get();

    questionCache = [];

    snapshot.forEach(function(doc) {

        const q = doc.data();

        q.id = doc.id;

        questionCache.push(q);

    });

    renderPage();

}

function renderPage() {

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    const pageItems = questionCache.slice(start, end);

    let html = "";

    pageItems.forEach(function(q) {

        html += `
        <div class="questionBox">

            <h3>${q.question}</h3>

            <p>
시대 : ${q.period || ""}
</p>

<p>
분야 : ${q.category}
</p>

<p>
난이도 : ${q.level}
</p>

<p>
유형 : ${q.type || ""}
</p>

            <button onclick="editQuestion('${q.id}')">수정</button>

            <button onclick="deleteQuestion('${q.id}')">삭제</button>

        </div>
        `;

    });

    document.getElementById("questionList").innerHTML = html;

    const totalPage = Math.max(
        1,
        Math.ceil(questionCache.length / pageSize)
    );

    document.getElementById("pageInfo").innerText =
        `${currentPage} / ${totalPage}`;

}

function clearForm() {

    document.getElementById("question").value = "";
    document.getElementById("choice1").value = "";
    document.getElementById("choice2").value = "";
    document.getElementById("choice3").value = "";
    document.getElementById("choice4").value = "";

    document.getElementById("answer").selectedIndex = 0;
    document.getElementById("category").selectedIndex = 0;
    document.getElementById("level").selectedIndex = 0;

    document.getElementById("explanation").value = "";
    document.getElementById("image").value = "";
    document.getElementById("source").value="";

document.getElementById("keywords").value="";

}

async function saveQuestion(){

    const imageUrl = await uploadImage();


    const data={

        question:
        document.getElementById("question").value,

        choices:[

            choice1.value,
            choice2.value,
            choice3.value,
            choice4.value

        ],

        answer:
        Number(answer.value),

        period:
        period.value,

        category:
        category.value,

        level:
        level.value,

        type:
        type.value,

        source:
        source.value,

        keywords:
        keywords.value.split(",")
        .map(k=>k.trim()),

        explanation:
        explanation.value,

        image:
        imageUrl,

        created:
        firebase.firestore.FieldValue.serverTimestamp()
       difficultyScore:70,

viewCount:0,

solveCount:0,

correctCount:0,

wrongCount:0,

createdBy:
auth.currentUser.uid,

updated:
firebase.firestore.FieldValue.serverTimestamp()
    };


    try{


        if(editDocId){


            await db.collection("questions")
            .doc(editDocId)
            .update(data);


            alert(
            "문제가 수정되었습니다."
            );


            editDocId=null;


        }else{


            await db.collection("questions")
            .add(data);


            alert(
            "문제가 등록되었습니다."
            );


        }


        clearForm();

        await loadQuestions();


    }

    catch(e){

        console.error(e);

        alert(
        "저장 오류 : "+e.message
        );

    }


}

async function editQuestion(id) {

    const doc = await db.collection("questions")
        .doc(id)
        .get();

    const q = doc.data();

    document.getElementById("question").value = q.question;

    document.getElementById("choice1").value = q.choices[0];
    document.getElementById("choice2").value = q.choices[1];
    document.getElementById("choice3").value = q.choices[2];
    document.getElementById("choice4").value = q.choices[3];

    document.getElementById("answer").value = q.answer;
    document.getElementById("category").value = q.category;
    document.getElementById("level").value = q.level;
    document.getElementById("period").value =
q.period || "고대";


document.getElementById("type").value =
q.type || "기출";


document.getElementById("source").value =
q.source || "";


document.getElementById("keywords").value =
(q.keywords || []).join(",");
    document.getElementById("explanation").value = q.explanation || "";
    document.getElementById("image").value = q.image || "";

    editDocId = id;

}

async function deleteQuestion(id) {

    const result = confirm("정말 삭제하시겠습니까?");

    if (!result) return;

    try {

        await db.collection("questions")
    .doc(id)
    .delete();

        alert("삭제되었습니다.");

        loadQuestions();
        loadDashboard();

    } catch (e) {

        alert(e.message);

    }

}

function searchQuestions() {

    const keyword =
        document.getElementById("searchQuestion")
        .value
        .trim()
        .toLowerCase();

    const category =
        document.getElementById("filterCategory").value;

    const level =
        document.getElementById("filterLevel").value;

    const result = questionCache.filter(function (q) {

        const matchKeyword =
            keyword === "" ||
            q.question.toLowerCase().includes(keyword);

        const matchCategory =
            category === "전체" ||
            q.category === category;

        const matchLevel =
            level === "전체" ||
            q.level === level;

        return (
            matchKeyword &&
            matchCategory &&
            matchLevel
        );

    });

    renderSearchResult(result);

}

function renderSearchResult(list) {

    let html = "";

    list.forEach(function (q) {

        html += `
        <div class="questionBox">

            <h3>${q.question}</h3>

            <p>
시대 : ${q.period || ""}
</p>

<p>
분야 : ${q.category}
</p>

<p>
난이도 : ${q.level}
</p>

<p>
유형 : ${q.type || ""}
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

    document.getElementById("questionList").innerHTML = html;

    document.getElementById("pageInfo").innerText =
        `${list.length}건 검색`;

}

function resetSearch() {

    document.getElementById("searchQuestion").value = "";

    document.getElementById("filterCategory").value = "전체";

    document.getElementById("filterLevel").value = "전체";

    currentPage = 1;

    renderPage();

}

function uploadCSV() {

    const file =
        document.getElementById("csvFile").files[0];

    if (!file) {

        alert("CSV 파일을 선택하세요.");
        return;

    }

    Papa.parse(file, {

        header: true,
        skipEmptyLines: true,

        complete: async function(result) {

            let count = 0;

            for (const row of result.data) {

                
const docRef =

await db.collection("questions")
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
    Number(row.answer)-1,


    period:
    row.period || "전체",


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
    row.keywords
    .split(",")
    .map(k=>k.trim())

    :
    [],



    explanation:
    row.explanation || "",


    image:
    row.image || "",


    created:

    firebase.firestore.FieldValue.serverTimestamp()

});


// 문제 통계 초기 생성

await db.collection("questionStats")
.doc(docRef.id)
.set({

    question:
    row.question,

    category:
    row.category,

    total:0,

    correct:0,

    wrong:0

});

                count++;

            }

            alert(count + "개 등록 완료");

            loadQuestions();
            loadDashboard();

        }

    });

}

async function downloadCSV() {

    const snapshot =
        await db.collection("questions").get();

    let csv =
"question,choice1,choice2,choice3,choice4,answer,category,level,explanation,image\n";

    snapshot.forEach(function(doc){

        const q = doc.data();

        csv +=

`"${q.question}","${q.choices[0]}","${q.choices[1]}","${q.choices[2]}","${q.choices[3]}",${q.answer+1},"${q.category}","${q.level}","${q.explanation||""}","${q.image||""}"\n`;

    });

    const blob = new Blob(

        ["\uFEFF"+csv],

        {

            type:"text/csv;charset=utf-8;"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "questions.csv";

    a.click();

    URL.revokeObjectURL(url);

}

async function loadDashboard() {

    // 문제 수
    const questionSnap =
        await db.collection("questions").get();

    document.getElementById("totalQuestion").innerText =
        questionSnap.size;

    // 회원 수
    const userSnap =
        await db.collection("users").get();

    document.getElementById("totalUser").innerText =
        userSnap.size;

    let examCount = 0;
    let wrongCount = 0;

    for (const user of userSnap.docs) {

        const quizSnap =
            await db.collection("users")
            .doc(user.id)
            .collection("quizHistory")
            .get();

        examCount += quizSnap.size;

        quizSnap.forEach(function(doc){

            wrongCount +=
                doc.data().wrongCount || 0;

        });

    }

    document.getElementById("totalExam").innerText =
        examCount;

    document.getElementById("totalWrong").innerText =
        wrongCount;

}

async function uploadImage() {

    const file =
        document.getElementById("imageFile").files[0];

    if (!file) {
        return document.getElementById("image").value || "";
    }

    const fileName =
        "history_images/" + Date.now() + "_" + file.name;

    const storageRef = storage.ref(fileName);

    await storageRef.put(file);

    const url = await storageRef.getDownloadURL();

    document.getElementById("image").value = url;

    return url;
}

async function loadStatistics(){

    const userSnap =
        await db.collection("users").get();

    let exam = 0;

    let wrong = 0;

    for(const user of userSnap.docs){

        const quizSnap =
            await db.collection("users")
            .doc(user.id)
            .collection("quizHistory")
            .get();

        exam += quizSnap.size;

        quizSnap.forEach(function(doc){

            wrong +=
                doc.data().wrongCount || 0;

        });

    }

    document.getElementById("statistics").innerHTML = `

        <p>회원 수 : ${userSnap.size}명</p>

        <p>누적 시험 : ${exam}회</p>

        <p>누적 오답 : ${wrong}문제</p>

        <p>평균 응시 :
        ${userSnap.size > 0 ? (exam / userSnap.size).toFixed(1) : 0}회
        </p>

    `;

}

// 문제 분석

document.getElementById("analysisBtn")
.onclick = loadQuestionAnalysis;



async function loadQuestionAnalysis(){


    const snapshot =
    await db.collection("questionStats")
    .get();



    let list = [];



    snapshot.forEach(function(doc){


        const q = doc.data();



        const wrongRate =

        q.total > 0

        ?

        Math.round(
            q.wrong / q.total * 100
        )

        :

        0;



        list.push({

            question:
            q.question,


            category:
            q.category,


            total:
            q.total,


            wrong:
            q.wrong,


            wrongRate:
            wrongRate

        });



    });



    list.sort(function(a,b){

        return b.wrongRate - a.wrongRate;

    });



    let html = `

    <h3>
    오답률 TOP 10
    </h3>

    `;



    list.slice(0,10)
    .forEach(function(q,index){


        html += `

        <div class="questionBox">


        <h4>
        ${index+1}위.
        ${q.question}
        </h4>


        <p>
        분야 : ${q.category}
        </p>


        <p>
        응시 :
        ${q.total}회
        </p>


        <p style="color:red">

        오답률 :
        ${q.wrongRate}%

        </p>


        </div>

        `;


    });



    document.getElementById(
    "analysisResult"
    )
    .innerHTML = html;


}

/*
auth.onAuthStateChanged(async function(user){


    if(!user){

        alert(
        "관리자 로그인이 필요합니다."
        );

        location.href="../index.html";

        return;

    }


    const adminDoc =
    await db.collection("users")
    .doc(user.uid)
    .get();



    if(
        !adminDoc.exists ||
        adminDoc.data().role !== "admin"
    ){

        alert(
        "관리자 권한이 없습니다."
        );

        location.href="../index.html";

        return;

    }


    console.log(
        "관리자 인증 완료"
    );


});
*/
