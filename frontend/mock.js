async function createMockExam(){


let exam=[];



for(
const period in MOCK_CONFIG.period
){


const count =
MOCK_CONFIG.period[period];



const snap =

await db.collection(
"questions"
)

.where(
"period",
"==",
period
)

.get();



let list=[];



snap.forEach(doc=>{


let q =
doc.data();


q.id =
doc.id;


list.push(q);


});



// 랜덤

list.sort(
()=>Math.random()-0.5
);



exam.push(
...list.slice(0,count)
);



}



exam.sort(
()=>Math.random()-0.5
);



return exam;


}