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

    // 로그인 버튼
    document.getElementById("adminLoginBtn").onclick = adminLogin;
document.getElementById("saveBtn").onclick = saveQuestion;

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

loadQuestions();
loadDashboard();
loadStatistics();

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

            <p>분야 : ${q.category}</p>

            <p>난이도 : ${q.level}</p>

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

}

async function saveQuestion() {

    const data = {

        question: document.getElementById("question").value,

        choices: [

            document.getElementById("choice1").value,
            document.getElementById("choice2").value,
            document.getElementById("choice3").value,
            document.getElementById("choice4").value

        ],

        answer: Number(document.getElementById("answer").value),

        category: document.getElementById("category").value,

        level: document.getElementById("level").value,

        explanation: document.getElementById("explanation").value,

        image: document.getElementById("image").value,

        created: new Date()

    };

    try {

        if (editDocId) {

    await db.collection("questions")
        .doc(editDocId)
        .update(data);

    editDocId = null;

    alert("문제가 수정되었습니다.");

} else {

    await db.collection("questions")
        .add(data);

    alert("문제가 등록되었습니다.");

}

        alert("문제가 등록되었습니다.");

        clearForm();

        loadQuestions();

        loadDashboard();

    } catch (e) {

        alert(e.message);

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
    document.getElementById("explanation").value = q.explanation || "";
    document.getElementById("image").value = q.image || "";

    editDocId = id;

}