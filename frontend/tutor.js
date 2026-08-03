// =================================
// AI 한국사 튜터
// =================================


document
.getElementById(
"askBtn"
)
.onclick =
askHistoryAI;



async function askHistoryAI(){


const question =

document.getElementById(
"userQuestion"
)
.value;



if(!question){

return;

}



const answer =

generateHistoryAnswer(
question
);



document
.getElementById(
"chatArea"
)
.innerHTML +=


`

<div class="user">

👤 ${question}

</div>


<div class="ai">

🤖 ${answer}

</div>

`;



}