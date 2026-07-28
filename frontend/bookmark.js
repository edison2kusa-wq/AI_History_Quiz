// =====================================
// AI 한국사
// bookmark.js
// =====================================


// 현재 즐겨찾기 상태
let isBookmarked = false;


// =====================================
// 즐겨찾기 추가
// =====================================

async function addBookmark(q){


    const user = auth.currentUser;


    if(!user){

        alert(
            "로그인이 필요합니다."
        );

        return;

    }



    if(!q){

        console.log(
            "문제 데이터 없음"
        );

        return;

    }



    try{


        await db

        .collection("users")

        .doc(user.uid)

        .collection("bookmarks")

        .doc(String(q.id))

        .set({


            question:

            q.question,


            choices:

            q.choices,


            answer:

            q.answer,


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



        alert(
            "즐겨찾기에 추가되었습니다."
        );


        isBookmarked=true;


        updateBookmarkButton();



    }

    catch(e){


        console.error(e);


        alert(
            "즐겨찾기 저장 실패"
        );


    }



}




// =====================================
// 즐겨찾기 삭제
// =====================================

async function removeBookmark(qid){


    const user = auth.currentUser;


    if(!user) return;



    try{


        await db

        .collection("users")

        .doc(user.uid)

        .collection("bookmarks")

        .doc(String(qid))

        .delete();



        isBookmarked=false;


        updateBookmarkButton();


    }


    catch(e){


        console.error(e);


    }


}



// =====================================
// 버튼 상태 변경
// =====================================

function updateBookmarkButton(){


    const btn =

    document.getElementById(
        "bookmarkBtn"
    );



    if(!btn) return;



    if(isBookmarked){


        btn.innerHTML =

        "⭐ 즐겨찾기 삭제";


    }

    else{


        btn.innerHTML =

        "☆ 즐겨찾기";


    }


}

// =====================================
// 즐겨찾기 목록 불러오기
// =====================================

async function loadBookmarks(){


    const user = auth.currentUser;


    if(!user){

        alert(
            "로그인이 필요합니다."
        );

        return;

    }



    const area =

    document.getElementById(
        "bookmarkList"
    );



    if(!area) return;



    try{


        const snapshot =

        await db

        .collection("users")

        .doc(user.uid)

        .collection("bookmarks")

        .orderBy(
            "created",
            "desc"
        )

        .get();



        if(snapshot.empty){


            area.innerHTML =

            `

            <h3>
            ⭐ 즐겨찾기
            </h3>

            <p>
            저장된 문제가 없습니다.
            </p>

            `;


            return;

        }




        let html =

        `

        <h3>
        ⭐ 즐겨찾기 목록
        </h3>

        `;



        snapshot.forEach(function(doc){


            const q =
            doc.data();


            html +=


            `

            <div class="questionBox">


                <h4>

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



                <button

                onclick="retryBookmark('${doc.id}')"

                >

                다시 풀기

                </button>




                <button

                onclick="removeBookmark('${doc.id}')"

                >

                삭제

                </button>



            </div>


            `;


        });



        area.innerHTML = html;



    }


    catch(e){


        console.error(e);


        alert(
            "즐겨찾기를 불러오지 못했습니다."
        );


    }


}

// =====================================
// 현재 문제 즐겨찾기 상태 확인
// =====================================

async function checkBookmarkStatus(qid){


    const user = auth.currentUser;


    if(!user) return;



    try{


        const doc =

        await db

        .collection("users")

        .doc(user.uid)

        .collection("bookmarks")

        .doc(String(qid))

        .get();



        isBookmarked =
        doc.exists;



        updateBookmarkButton();



    }


    catch(e){


        console.error(e);


    }


}





// =====================================
// 즐겨찾기 버튼 이벤트
// =====================================

function initBookmark(){


    const btn =

    document.getElementById(
        "bookmarkBtn"
    );



    if(!btn) return;



    btn.addEventListener(

        "click",

        async function(){



            if(!quizList ||
               quizList.length===0){

                return;

            }



            const q =

            quizList[currentQuestion];



            if(!q.id){


                alert(
                    "문제 ID가 없습니다."
                );


                return;

            }



            if(isBookmarked){


                await removeBookmark(
                    q.id
                );


            }

            else{


                await addBookmark(q);


            }



        }

    );


}





// =====================================
// 즐겨찾기 문제 다시 풀기
// =====================================

async function retryBookmark(id){



    const user = auth.currentUser;


    if(!user) return;



    try{


        const doc =

        await db

        .collection("users")

        .doc(user.uid)

        .collection("bookmarks")

        .doc(id)

        .get();



        if(!doc.exists){

            alert(
                "문제를 찾을 수 없습니다."
            );

            return;

        }



        const q = doc.data();



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