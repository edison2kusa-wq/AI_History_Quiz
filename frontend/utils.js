// ===========================================
// AI 한국사 심화 퀴즈
// frontend/utils.js
// ===========================================

// ---------------------------
// DOM
// ---------------------------

function $(id) {
    return document.getElementById(id);
}

function show(id) {

    const el = $(id);

    if (el)
        el.style.display = "";

}

function hide(id) {
    const el = $(id);
    if (el) el.style.display = "none";
}

function toggle(id) {
    const el = $(id);

    if (!el) return;

    if (el.style.display === "none") {
        el.style.display = "block";
    } else {
        el.style.display = "none";
    }
}

function clearHTML(id) {

    const el = $(id);

    if (el) {
        el.innerHTML = "";
    }

}

// ---------------------------
// LocalStorage
// ---------------------------

function loadLocal(key, defaultValue = []) {

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || defaultValue;

    } catch {

        return defaultValue;

    }

}

function saveLocal(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}

function removeLocal(key) {

    localStorage.removeItem(key);

}

// ---------------------------
// 날짜
// ---------------------------

function nowString() {

    const d = new Date();

    const y = d.getFullYear();

    const m =
        String(d.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(d.getDate())
        .padStart(2, "0");

    const h =
        String(d.getHours())
        .padStart(2, "0");

    const min =
        String(d.getMinutes())
        .padStart(2, "0");

    return `${y}-${m}-${day} ${h}:${min}`;

}

function formatDate(date) {

    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleDateString("ko-KR");

}

// ---------------------------
// 문자열
// ---------------------------

function escapeHTML(text) {

    if (!text) return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function randomItem(arr) {

    return arr[
        Math.floor(Math.random() * arr.length)
    ];

}

function shuffle(array) {

    let currentIndex = array.length;

    while (currentIndex !== 0) {

        const randomIndex =
            Math.floor(Math.random() * currentIndex);

        currentIndex--;

        [
            array[currentIndex],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[currentIndex]
        ];

    }

    return array;

}

// ===========================================
// Firestore 공통
// ===========================================

async function getCollection(name) {

    const snapshot =
        await db.collection(name).get();

    const result = [];

    snapshot.forEach(function (doc) {

        const data = doc.data();

        data.id = doc.id;

        result.push(data);

    });

    return result;

}

async function getDocument(collection, id) {

    const doc =
        await db.collection(collection)
        .doc(id)
        .get();

    if (!doc.exists) return null;

    const data = doc.data();

    data.id = doc.id;

    return data;

}

async function addDocument(collection, data) {

    return await db
        .collection(collection)
        .add(data);

}

async function updateDocument(collection, id, data) {

    return await db
        .collection(collection)
        .doc(id)
        .update(data);

}

async function deleteDocument(collection, id) {

    return await db
        .collection(collection)
        .doc(id)
        .delete();

}

// ===========================================
// Loading
// ===========================================

function showLoading(text = "불러오는 중...") {

    let loading = $("loadingBox");

    if (!loading) {

        loading =
            document.createElement("div");

        loading.id = "loadingBox";

        loading.style.position = "fixed";
        loading.style.top = "0";
        loading.style.left = "0";
        loading.style.width = "100%";
        loading.style.height = "100%";
        loading.style.background = "rgba(0,0,0,0.5)";
        loading.style.display = "flex";
        loading.style.alignItems = "center";
        loading.style.justifyContent = "center";
        loading.style.zIndex = "9999";
        loading.style.color = "white";
        loading.style.fontSize = "22px";

        document.body.appendChild(loading);

    }

    loading.innerHTML = text;

    loading.style.display = "flex";

}

function hideLoading() {

    const loading = $("loadingBox");

    if (loading) {

        loading.style.display = "none";

    }

}

// ===========================================
// Alert
// ===========================================

function success(message) {

    alert("✅ " + message);

}

function error(message) {

    alert("❌ " + message);

}

function info(message) {

    alert("ℹ " + message);

}

// ===========================================
// Score
// ===========================================

function calcPercent(score, total) {

    if (total === 0) return 0;

    return Math.round(score / total * 100);

}

function grade(score, total) {

    const percent =
        calcPercent(score, total);

    if (percent >= 95) return "S";
    if (percent >= 90) return "A";
    if (percent >= 80) return "B";
    if (percent >= 70) return "C";
    if (percent >= 60) return "D";

    return "F";

}

// ===========================================
// Time
// ===========================================

function secondToText(sec) {

    const min =
        Math.floor(sec / 60);

    const second =
        sec % 60;

    return (
        String(min).padStart(2, "0")
        + ":"
        + String(second).padStart(2, "0")
    );

}

// ===========================================
// Random ID
// ===========================================

function uuid() {

    return Math.random()
        .toString(36)
        .substring(2)
        +
        Date.now()
        .toString(36);

}

// ===========================================
// Console
// ===========================================

function log(title, value) {

    console.log(
        "[" + title + "]",
        value
    );

}

// =====================================
// 배열 랜덤 섞기
// =====================================

function shuffleArray(array){

    for(let i = array.length - 1; i > 0; i--){

        const j = Math.floor(
            Math.random() * (i + 1)
        );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }


    return array;

}