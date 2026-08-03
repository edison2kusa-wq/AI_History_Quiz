// ===========================================
// AI 한국사 오답노트
// wrong.js
// ===========================================


document.addEventListener(
"DOMContentLoaded",
function(){


    auth.onAuthStateChanged(

        function(user){


            if(user){


                console.log(
                    "로그인 확인:",
                    user.uid
                );


                loadWrongAnswers();


            }

            else{


                document.getElementById(
                    "wrongList"
                ).innerHTML =


                `

                <h3>
                로그인이 필요합니다.
                </h3>


                <a href="index.html">

                로그인 화면으로 이동

                </a>

                `;


            }


        }

    );


});





async function loadWrongAnswers(){


    async function loadWrongAnswers(user){




    if(!user){

        document.getElementById(
            "wrongList"
        ).innerHTML =

        `
        <h3>
        로그인이 필요합니다.
        </h3>
        `;

        return;

    }



    const snapshot =

    await db.collection("users")

    .doc(user.uid)

    .collection("wrongAnswers")

    .orderBy(
        "created",
        "desc"
    )

    .get();




    let html="";



    if(snapshot.empty){


        html=

        `
        <h3>
        틀린 문제가 없습니다.
        </h3>
        `;


    }



    snapshot.forEach(function(doc){


        const q =
        doc.data();



        html +=


        `

        <div class="questionBox">


        <h3>
        ❌ ${q.question}
        </h3>
<button onclick="retryOne('${doc.id}')">

🔄 다시 풀기

</button>


        <p>
        내가 선택한 답 :
        ${q.selected+1}번
        </p>



        <p>
        정답 :
        ${q.answer+1}번
        </p>



        <p>
        시대 :
        ${q.period}
        </p>



        <p>
        분야 :
        ${q.category}
        </p>



        <hr>


        <p>

        ${q.explanation || 
        "해설 없음"}

        </p>



        </div>


        `;



    });



    document.getElementById(
        "wrongList"
    ).innerHTML = html;


}

// ===========================================
// 오답 1문제 다시 풀기
// ===========================================

function retryOne(id){


    location.href =
    "quiz.html?wrong="+id;


}

// ===========================================
// 전체 오답 다시 풀기
// ===========================================

async function retryAllWrong(){


    const user =
    auth.currentUser;



    if(!user){

        alert(
        "로그인이 필요합니다."
        );

        return;

    }



    const snapshot =

    await db.collection("users")

    .doc(user.uid)

    .collection("wrongAnswers")

    .get();



    if(snapshot.empty){


        alert(
        "오답 문제가 없습니다."
        );


        return;

    }



    let count =

    Number(

        document.getElementById(
        "wrongCount"
        ).value

    );



    let list=[];



    snapshot.forEach(function(doc){


        let q =
        doc.data();


        q.id =
        doc.id;


        list.push(q);


    });



    // 랜덤 출제

    list.sort(
        ()=>Math.random()-0.5
    );



    list =
    list.slice(0,count);



    sessionStorage.setItem(

        "wrongQuiz",

        JSON.stringify(list)

    );



    location.href =
    "quiz.html?mode=wrong";


}