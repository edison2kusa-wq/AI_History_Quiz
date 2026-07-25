// 저장 버튼

document.getElementById("saveBtn")
.onclick = function(){


    const question =
    document.getElementById("question").value;


    const choices = [

        document.getElementById("choice1").value,

        document.getElementById("choice2").value,

        document.getElementById("choice3").value,

        document.getElementById("choice4").value

    ];



    const answer =
    Number(
        document.getElementById("answer").value
    );



    const data = {


        id:
        Date.now(),


        year:
        document.getElementById("year").value,


        category:
        document.getElementById("category").value,


        level:
        document.getElementById("level").value,


        question:
        question,


        choices:
        choices,


        answer:
        answer,


        explanation:
        document.getElementById("explanation").value,


        image:""

    };



    let questions =

    JSON.parse(

        localStorage.getItem("questions")

    ) || [];



    const editId =
document.getElementById("editId").value;


if(editId){

    questions =
    questions.map(function(q){

        if(q.id == editId){

            return data;

        }

        return q;

    });


}
else{

    questions.push(data);

}



    localStorage.setItem(

        "questions",

        JSON.stringify(questions)

    );



    alert("문제가 저장되었습니다.");



    clearForm();



};




// 입력 초기화

function clearForm(){


    document.getElementById("question").value="";


    document.getElementById("choice1").value="";

    document.getElementById("choice2").value="";

    document.getElementById("choice3").value="";

    document.getElementById("choice4").value="";

    document.getElementById("explanation").value="";

document.getElementById("editId").value="";

}




// 등록 문제 보기

document.getElementById("viewBtn")
.onclick=function(){


    const list =
    document.getElementById("list");



    list.innerHTML="";



    const questions =

    JSON.parse(

        localStorage.getItem("questions")

    ) || [];



    if(questions.length===0){

        list.innerHTML=
        "<p>등록된 문제가 없습니다.</p>";

        return;

    }



    questions.forEach(function(q,index){



        const div =
        document.createElement("div");


        div.className=
        "question-item";



        div.innerHTML=

`
<strong>
${index+1}. ${q.question}
</strong>

<br>

시대 :
${q.year}

<br>

분야 :
${q.category}

<br>

난이도 :
${q.level}

<br>

정답 :
${q.choices[q.answer]}

<br><br>

<button onclick="editQuestion(${q.id})">
수정
</button>


<button onclick="deleteQuestion(${q.id})">
삭제
</button>

`;



        list.appendChild(div);



    });


};
function deleteQuestion(id){


    let questions =

    JSON.parse(

        localStorage.getItem("questions")

    ) || [];



    questions = questions.filter(function(q){

        return q.id !== id;

    });



    localStorage.setItem(

        "questions",

        JSON.stringify(questions)

    );



    alert("삭제되었습니다.");


    location.reload();

}
function editQuestion(id){


    const questions =

    JSON.parse(

        localStorage.getItem("questions")

    ) || [];



    const q =

    questions.find(function(item){

        return item.id === id;

    });



    document.getElementById("editId").value =
    q.id;


    document.getElementById("question").value =
    q.question;


    document.getElementById("choice1").value =
    q.choices[0];


    document.getElementById("choice2").value =
    q.choices[1];


    document.getElementById("choice3").value =
    q.choices[2];


    document.getElementById("choice4").value =
    q.choices[3];


    document.getElementById("answer").value =
    q.answer;


    document.getElementById("year").value =
    q.year;


    document.getElementById("category").value =
    q.category;


    document.getElementById("level").value =
    q.level;


    document.getElementById("explanation").value =
    q.explanation;


    window.scrollTo(0,0);


}
document.getElementById("csvUploadBtn")
.onclick=function(){


    const file =

    document.getElementById("csvFile")
    .files[0];


    if(!file){

        alert("CSV 파일을 선택하세요.");

        return;

    }



    const reader =
    new FileReader();



    reader.onload=function(e){


        const lines =
        e.target.result
        .split("\n");



        let questions =

        JSON.parse(

            localStorage.getItem("questions")

        ) || [];



        for(let i=1; i<lines.length; i++){


            const row =
            lines[i].split(",");



            if(row.length < 10)
            continue;



            const q = {


                id:
                Date.now()+i,


                year:
                row[0],


                category:
                row[1],


                level:
                row[2],


                question:
                row[3],


                choices:[

                    row[4],
                    row[5],
                    row[6],
                    row[7]

                ],


                answer:
                Number(row[8]),


                explanation:
                row[9],


                image:""


            };


            questions.push(q);


        }



        localStorage.setItem(

            "questions",

            JSON.stringify(questions)

        );



        alert(
        "CSV 등록 완료"
        );


    };



    reader.readAsText(file);


};