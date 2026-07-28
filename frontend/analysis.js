// =====================================
// Firebase 기반 취약 분야 분석
// =====================================

async function getWeakArea(){

    const result = [];

    const user = auth.currentUser;

    if(!user){

        return result;

    }


    const snapshot =

    await db.collection("users")

    .doc(user.uid)

    .collection("quizHistory")

    .get();



    const category = {};



    snapshot.forEach(function(doc){


        const item = doc.data();


        const c =
        item.category || "기타";



        if(!category[c]){


            category[c]={

                total:0,

                wrong:0

            };


        }



        category[c].total +=
        item.total || 0;



        category[c].wrong +=
        item.wrongCount || 0;



    });



    Object.keys(category)

    .forEach(function(key){


        const rate =

        category[key].total > 0

        ?

        Math.round(

            category[key].wrong /

            category[key].total *

            100

        )

        :

        0;



        result.push({

            name:key,

            score:rate

        });


    });



    result.sort(function(a,b){

        return b.score-a.score;

    });



    return result.slice(0,5);


}