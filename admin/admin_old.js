// 관리자 문제 관리 프로그램


// 문제 목록
let currentPage = 1;

const pageSize = 20;

let questionCache = [];

function loadQuestions(){

    db.collection("questions")
    .get()
    .then(function(snapshot){

        questionCache = [];

        snapshot.forEach(function(doc){

            const q = doc.data();

            q.id = doc.id;

            questionCache.push(q);

        });

        currentPage = 1;

        renderPage();

        document.getElementById("totalQuestion").innerText =
            questionCache.length;

    });

}



function editQuestion(id){

    db.collection("questions")
    .doc(id)
    .get()
    .then(function(doc){

        const q = doc.data();

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

// 삭제

function deleteQuestion(id){


if(confirm("삭제하시겠습니까?")){


db.collection("questions")
.doc(id)
.delete()

.then(function(){


alert("삭제 완료");


loadQuestions();

loadDashboard();

loadStatistics();


});


}


}





// 관리자 로그인

document.getElementById("adminLoginBtn")
.onclick=function(){


const email =
document.getElementById("adminEmail").value;


const password =
document.getElementById("adminPassword").value;



auth.signInWithEmailAndPassword(
email,
password
)

.then(function(){

    alert("관리자 로그인 성공");

    document.getElementById("loginArea").style.display="none";
    document.getElementById("adminArea").style.display="block";

    loadQuestions();

    loadDashboard();

    loadStatistics();

})


.catch(function(error){


alert(
"로그인 실패 : "
+ error.message
);


});


};





// 문제 저장

document.getElementById("saveBtn").onclick = function(){

    const data = {

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
        document.getElementById("image").value,

        updated:new Date()

    };


    if(window.editDocId){

        db.collection("questions")
        .doc(window.editDocId)
        .update(data)

        .then(function(){

            alert("문제 수정 완료");

            window.editDocId = null;

            clearForm();

            loadQuestions();

loadDashboard();

loadStatistics();

        });

    }

    else{

        data.created = new Date();

        db.collection("questions")
        .add(data)

        .then(function(){

            alert("문제 등록 완료");

            clearForm();

            loadQuestions();

loadDashboard();

loadStatistics();

        });

    }

};

function clearForm(){

    document.getElementById("question").value="";

    document.getElementById("choice1").value="";

    document.getElementById("choice2").value="";

    document.getElementById("choice3").value="";

    document.getElementById("choice4").value="";

    document.getElementById("answer").selectedIndex=0;

    document.getElementById("category").selectedIndex=0;

    document.getElementById("level").selectedIndex=0;

    document.getElementById("explanation").value="";

    document.getElementById("image").value="";

}


document.getElementById("downloadCsvBtn").onclick = function(){

    db.collection("questions")
    .get()
    .then(function(snapshot){

        let csv =
"question,choice1,choice2,choice3,choice4,answer,category,level,explanation,image\n";

        snapshot.forEach(function(doc){

            const q = doc.data();

            csv += `"${q.question}","${q.choices[0]}","${q.choices[1]}","${q.choices[2]}","${q.choices[3]}",${q.answer+1},"${q.category}","${q.level}","${q.explanation || ""}","${q.image || ""}"\n`;

        });

        const blob = new Blob(
            ["\uFEFF"+csv],
            {type:"text/csv;charset=utf-8;"}
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = "questions.csv";

        a.click();

        URL.revokeObjectURL(url);

    });

};

document.getElementById("searchBtn").onclick = function(){

    const keyword =
    document.getElementById("searchQuestion")
    .value
    .trim()
    .toLowerCase();

    const category =
    document.getElementById("filterCategory").value;
    const level =
document.getElementById("filterLevel").value;
    db.collection("questions")
    .get()
    .then(function(snapshot){

        let html = "";

        snapshot.forEach(function(doc){

            const q = doc.data();

            const matchKeyword =
                !keyword ||
                (q.question &&
                q.question.toLowerCase().includes(keyword));

            const matchCategory =
                category === "전체" ||
                q.category === category;
            const matchLevel =

level === "전체" ||

q.level === level;
            if(
matchKeyword &&

matchCategory &&

matchLevel

){

                html += `

                <div class="questionBox">

                    <h3>${q.question}</h3>

                    <p>분야 : ${q.category}</p>

                    <p>난이도 : ${q.level}</p>

                    <button onclick="editQuestion('${doc.id}')">
                    수정
                    </button>

                    <button onclick="deleteQuestion('${doc.id}')">
                    삭제
                    </button>

                </div>

                `;

            }

        });
});
};
        

document.getElementById("resetBtn").onclick = function(){

    document.getElementById("searchQuestion").value = "";
    document.getElementById("filterLevel").value = "전체";
    loadQuestions();

loadDashboard();

loadStatistics();
    
};

function renderPage(){

    const totalPage =
    Math.ceil(questionCache.length / pageSize);

    document.getElementById("pageInfo").innerText =
    `${currentPage} / ${totalPage}`;

}

document.getElementById("prevPageBtn").onclick = function(){

    if(currentPage > 1){

        currentPage--;

        renderPage();

    }

};

document.getElementById("nextPageBtn").onclick = function(){

    const totalPage =
    Math.ceil(questionCache.length / pageSize);

    if(currentPage < totalPage){

        currentPage++;

        renderPage();

    }

};

function loadStatistics(){

    db.collection("users")
    .get()
    .then(async function(snapshot){

        let userCount = snapshot.size;

        let totalExam = 0;
        let totalWrong = 0;

        for(const doc of snapshot.docs){

            const quiz =
            await db.collection("users")
            .doc(doc.id)
            .collection("quizHistory")
            .get();

            totalExam += quiz.size;

            quiz.forEach(function(item){

                totalWrong +=
                item.data().wrongCount || 0;

            });

        }

        document.getElementById("statistics").innerHTML = `

<p>누적 시험 : ${totalExam}회</p>

<p>누적 오답 : ${totalWrong}문제</p>

<p>회원당 평균 시험 :
${userCount > 0 ? (totalExam/userCount).toFixed(1) : 0}회
</p>

`;

    });

}

async function loadDashboard(){

    const questionSnap =
    await db.collection("questions").get();

    document.getElementById("totalQuestion").innerText =
        questionSnap.size;

    const userSnap =
    await db.collection("users").get();

    document.getElementById("totalUser").innerText =
        userSnap.size;

}