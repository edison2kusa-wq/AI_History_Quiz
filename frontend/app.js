let currentQuestion = 0;
let score = 0;

// 문제를 화면에 표시
function showQuestion() {

    const q = questions[currentQuestion];

    document.getElementById("progress").innerText =
        `문제 ${currentQuestion + 1} / ${questions.length}`;

    document.getElementById("question").innerText =
        q.question;
    document.getElementById("questionImage").src = q.image;
    const choiceBox = document.getElementById("choices");
    choiceBox.innerHTML = "";

    q.choices.forEach((choice, index) => {

        const btn = document.createElement("button");

        btn.innerText = `${index + 1}. ${choice}`;

        btn.onclick = function () {
            checkAnswer(index);
        };

        choiceBox.appendChild(btn);
    });

    document.getElementById("result").innerHTML = "";
    document.getElementById("nextBtn").style.display = "none";
}

// 정답 확인
function checkAnswer(selected) {

    const q = questions[currentQuestion];

    if (selected === q.answer) {

        score++;

        document.getElementById("result").innerHTML =
            `<p style="color:green;">⭕ 정답입니다!</p>
             <p>${q.explanation}</p>`;

    } else {

        document.getElementById("result").innerHTML =
            `<p style="color:red;">❌ 오답입니다.</p>
             <p><strong>정답:</strong> ${q.choices[q.answer]}</p>
             <p>${q.explanation}</p>`;
    }

    document.getElementById("nextBtn").style.display = "inline-block";
}

// 다음 문제
document.getElementById("nextBtn").onclick = function () {

    currentQuestion++;

    if (currentQuestion < questions.length) {

        showQuestion();

    } else {

        document.querySelector(".container").innerHTML = `
            <h1>시험 종료</h1>
            <h2>${questions.length}문제 중 ${score}문제 정답</h2>
            <button onclick="location.reload()">다시 시작</button>
        `;
    }
};

// 첫 문제 표시
showQuestion();