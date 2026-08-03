async function loadRanking(){


const snap =

await db.collection(
"ranking"
)

.orderBy(
"point",
"desc"
)

.limit(50)

.get();



let html="";


let rank=1;



snap.forEach(function(doc){


const r =
doc.data();


html +=

`

<div class="rankingBox">

<h3>

${rank}위

${r.nickname}

</h3>


<p>

${r.level}

</p>


<p>

⭐ ${r.point}점

</p>


</div>

`;


rank++;


});


document.getElementById(
"rankingList"
)
.innerHTML=html;


}


loadRanking();