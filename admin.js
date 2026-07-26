let questions =
JSON.parse(
localStorage.getItem("questions")
)
|| [];



function saveQuestion(){


    
let q={


id:
Date.now(),


created:
new Date().toLocaleString(),


count:0,


year:
document.getElementById("year").value,


category:
document.getElementById("category").value,


level:
document.getElementById("level").value,


image:
document.getElementById("image").value,



question:
document.getElementById("question").value,


choices:[

document.getElementById("choice1").value,

document.getElementById("choice2").value,

document.getElementById("choice3").value,

document.getElementById("choice4").value

],


answer:
Number(
document.getElementById("answer").value
),


explanation:
document.getElementById("explanation").value


};



questions.push(q);



localStorage.setItem(

"questions",

JSON.stringify(questions)

);



alert(
"문제가 저장되었습니다."
);



location.reload();


}



function showList(){


let html="";


let keyword =
document.getElementById("search").value;


questions.forEach(function(q,index){


if(
keyword &&
!q.question.includes(keyword)
){

return;

}



html +=

`

<div style="
border:1px solid #ddd;
padding:10px;
margin:10px;
">


<b>
${index+1}. ${q.question}
</b>

<p>
ID : ${q.id || ""}
</p>

<p>
등록일 :
${q.created || ""}
</p>

<p>
출제횟수 :
${q.count || 0}회
</p>

<p>
분야 : ${q.category || ""}
</p>


<p>
난이도 : ${q.level || ""}
</p>



<button onclick="editQuestion(${index})">

수정

</button>



<button onclick="deleteQuestion(${index})">

삭제

</button>



</div>

`;


});


document.getElementById("list")
.innerHTML=html;


}



function deleteQuestion(index){


let check =
confirm(
"정말 삭제하시겠습니까?"
);


if(!check){

return;

}


questions.splice(index,1);


localStorage.setItem(

"questions",

JSON.stringify(questions)

);


location.reload();


}


showList();
function editQuestion(index){


let q = questions[index];


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


document.getElementById("explanation").value =
q.explanation;


questions.splice(index,1);


localStorage.setItem(

"questions",

JSON.stringify(questions)

);


alert(
"수정할 내용을 입력 후 다시 저장하세요."
);


}

function uploadCSV(){


const file =
document.getElementById("csvFile").files[0];


if(!file){

alert(
"CSV 파일을 선택하세요."
);

return;

}



const reader =
new FileReader();



reader.onload=function(e){


let text =
e.target.result;



let rows =
text.split("\n");



rows.shift();



rows.forEach(function(row){


let data =
row.split(",");



let q={


year:data[0],


category:data[1],


level:data[2],


question:data[3],


choices:[

data[4],

data[5],

data[6],

data[7]

],


answer:Number(data[8]),


explanation:data[9],


image:data[10] || ""



};



questions.push(q);



});



localStorage.setItem(

"questions",

JSON.stringify(questions)

);



alert(
"CSV 등록 완료 : "
+
(rows.length)
+
"문제"
);



location.reload();


};


reader.readAsText(file,"UTF-8");


}

function showStatistics(){


let total =
questions.length;


let html =

`

<p>
전체 문제 :
${total}개
</p>

`;


let category={};



questions.forEach(function(q){


if(!category[q.category]){

category[q.category]=0;

}


category[q.category]++;


});



html += "<h3>분야별</h3>";


for(let key in category){

html +=

`

<p>
${key} :
${category[key]}개
</p>

`;

}



document.getElementById(
"statistics"
)
.innerHTML=html;


}
function showWeakCategory(){


let data =
JSON.parse(
localStorage.getItem("weakCategory")
)
|| {};



let html =
"<h3>많이 틀린 분야</h3>";



let arr =
Object.entries(data);



arr.sort(
(a,b)=>b[1]-a[1]
);



arr.forEach(function(item){


html +=

`

<p>
${item[0]}
:
${item[1]}회 오답
</p>

`;



});



document.getElementById(
"weak"
)
.innerHTML=html;


}