// =====================================
// AI 한국사
// wrongnote.js
// =====================================


// 오답 목록
let wrongList = [];



// =====================================
// 오답 저장
// =====================================

async function saveWrongAnswer(q, selected){


    const user = auth.currentUser;


    if(!user){

        console.log(
            "로그인 사용자 없음"
        );

        return;

    }



    if(!q || !q.id){

        console.log(
            "문제 ID 없음",
            q
        );

        return;

    }



    try{


        await db

        .collection("users")

        .doc(user.uid)

        .collection("wrongAnswers")

        .doc(String(q.id))

        .set({


            question:

            q.question,


            choices:

            q.choices,


            answer:

            q.answer,


            selected:

            selected,


            explanation:

            q.explanation || "",


            category:

            q.category || "",


            period:

            q.period || "",


            level:

            q.level || "",


            image:

            q.image || "",


            created:

            firebase.firestore.FieldValue.serverTimestamp()


        });


    }


    catch(e){


        console.error(
            "오답 저장 오류",
            e
        );


    }


}
// =====================================
// 오답노트 불러오기
// =====================================

async function loadWrongNote(){


    const user = auth.currentUser;


    if(!user){

        alert(
            "로그인이 필요합니다."
        );

        return;

    }



    const area =

    document.getElementById(
        "wrongNote"
    );



    if(!area) return;



    try{


        const snapshot =

        await db

        .collection("users")

        .doc(user.uid)

        .collection("wrongAnswers")

        .orderBy(
            "created",
            "desc"
        )

        .get();



        wrongList=[];



        snapshot.forEach(function(doc){


            const q =
            doc.data();


            q.id =
            doc.id;


            wrongList.push(q);


        });




        if(wrongList.length===0){


            area.innerHTML =


            `

            <h3>
            📒 오답노트
            </h3>


            <p>
            저장된 오답이 없습니다.
            </p>

            `;


            return;

        }





        let html =


        `

        <h3>
        📒 오답노트
        </h3>

        <p>

        총 ${wrongList.length}개

        </p>

        `;



        wrongList.forEach(function(q,index){


            html +=


            `

            <div class="questionBox">


            <h4>

            ${index+1}.
            ${q.question}

            </h4>


            <p>

            분야 :
            ${q.category || ""}

            </p>


            <p>

            시대 :
            ${q.period || ""}

            </p>


            <p>

            정답 :

            ${q.answer+1}번

            </p>



            <p>

            해설 :

            ${q.explanation || "없음"}

            </p>



            <button

            onclick="retryWrong('${q.id}')"

            >

            다시 풀기

            </button>



            <button

            onclick="deleteWrong('${q.id}')"

            >

            삭제

            </button>


            </div>


            `;


        });



        area.innerHTML=html;


    }


    catch(e){


        console.error(e);


        alert(
            "오답노트를 불러오지 못했습니다."
        );


    }


}

// =====================================
// 오답 삭제
// =====================================

async function deleteWrong(id){


    const user =
    auth.currentUser;


    if(!user) return;



    const ok =
    confirm(
        "오답 기록을 삭제하시겠습니까?"
    );


    if(!ok) return;



    try{


        await db

        .collection("users")

        .doc(user.uid)

        .collection("wrongAnswers")

        .doc(id)

        .delete();



        loadWrongNote();


    }


    catch(e){


        console.error(e);


    }


}

// =====================================
// 오답 다시 풀기
// =====================================

async function retryWrong(id){


    const user =
    auth.currentUser;


    if(!user) return;



    try{


        const doc =

        await db

        .collection("users")

        .doc(user.uid)

        .collection("wrongAnswers")

        .doc(id)

        .get();



        if(!doc.exists){

            alert(
                "문제를 찾을 수 없습니다."
            );

            return;

        }



        const q = doc.data();


        q.id=id;



        quizList=[q];


        currentQuestion=0;


        score=0;


        wrongAnswers=[];



        document

        .getElementById(
            "mainMenu"
        )

        .style.display="none";



        document

        .getElementById(
            "quizScreen"
        )

        .style.display="block";



        showQuestion();



    }


    catch(e){


        console.error(e);


    }


}




// =====================================
// 전체 오답 다시 풀기
// =====================================

function retryAllWrong(){


    if(wrongList.length===0){


        alert(
            "오답 문제가 없습니다."
        );


        return;

    }



    quizList =
    [...wrongList];



    currentQuestion=0;


    score=0;


    wrongAnswers=[];



    document

    .getElementById(
        "mainMenu"
    )

    .style.display="none";



    document

    .getElementById(
        "quizScreen"
    )

    .style.display="block";



    showQuestion();


}



// =====================================
// 오답 분야 통계
// =====================================

function analyzeWrongCategory(){


    const result={};



    wrongList.forEach(function(q){


        const category =

        q.category || "기타";



        if(!result[category]){


            result[category]=0;


        }



        result[category]++;


    });



    return result;


}

// =====================================
// Wrong Note 초기화
// =====================================

document.addEventListener(
"DOMContentLoaded",
function(){

    console.log("wrongnote 초기화");

    const btn =
    document.getElementById(
        "wrongNoteBtn"
    );

    if(btn){

        btn.onclick =
        loadWrongNote;

    }

});