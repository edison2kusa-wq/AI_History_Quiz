// ===========================================
// AI 한국사 오답노트
// wrong.js
// ===========================================


document.addEventListener(
"DOMContentLoaded",
function(){

    loadWrongAnswers();

});





async function loadWrongAnswers(){


    const user =
    auth.currentUser;



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