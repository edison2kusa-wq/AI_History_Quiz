// ===========================================
// AI 한국사 심화 퀴즈
// auth.js
// ===========================================

// 현재 로그인 사용자
let currentUser = null;

// ---------------------------
// 초기화
// ---------------------------

function initAuth() {
    console.log("initAuth 실행");
    auth.onAuthStateChanged(async function (user) {

        if (user) {

            currentUser = user;

            console.log("로그인 :", user.email);

            showAfterLogin(user);

            await saveUserInfo(user);

        } else {

            currentUser = null;

            showBeforeLogin();

        }

    });

    if ($("signupBtn"))
        $("signupBtn").onclick = signup;

    if ($("loginBtn"))
        $("loginBtn").onclick = login;

}

// ---------------------------
// 회원가입
// ---------------------------

async function signup() {

    const email = $("email").value.trim();
    const password = $("password").value;

    if (email === "" || password === "") {

        alert("이메일과 비밀번호를 입력하세요.");

        return;

    }

    try {

        const result =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );

        await saveUserInfo(result.user);

        alert("회원가입 완료");

    } catch (e) {

        alert(e.message);

    }

}

// ---------------------------
// 로그인
// ---------------------------

async function login() {

    const email = $("email").value.trim();

    const password = $("password").value;

    if (email === "" || password === "") {

        alert("이메일과 비밀번호를 입력하세요.");

        return;

    }

    try {

        await auth.signInWithEmailAndPassword(
            email,
            password
        );

        alert("로그인 성공");

    } catch (e) {

        alert(e.message);

    }

}

// ---------------------------
// 로그아웃
// ---------------------------

async function logout() {

    await auth.signOut();

    alert("로그아웃되었습니다.");

}

// ---------------------------
// 사용자 저장
// ---------------------------

async function saveUserInfo(user) {

    const ref =
        db.collection("users")
        .doc(user.uid);

    const doc =
        await ref.get();

    if (!doc.exists) {

        await ref.set({

            uid: user.uid,

            email: user.email,

            created:
                firebase.firestore.FieldValue.serverTimestamp(),

            lastLogin:
                firebase.firestore.FieldValue.serverTimestamp(),

            role: "user"

        });

    } else {

        await ref.update({

            lastLogin:
                firebase.firestore.FieldValue.serverTimestamp()

        });

    }

}

// ---------------------------
// 관리자 여부
// ---------------------------

async function isAdmin() {

    if (!currentUser) return false;

    const doc =
        await db.collection("users")
        .doc(currentUser.uid)
        .get();

    if (!doc.exists) return false;

    return doc.data().role === "admin";

}

// ---------------------------
// 로그인 화면
// ---------------------------

function showBeforeLogin() {

    if ($("loginBox"))
        $("loginBox").style.display = "block";

    if ($("adminBtn"))
        $("adminBtn").style.display = "none";

}

// ---------------------------
// 로그인 후
// ---------------------------

async function showAfterLogin(user) {

    if ($("loginBox"))
        $("loginBox").style.display = "none";

    if (await isAdmin()) {

        if ($("adminBtn"))
            $("adminBtn").style.display = "inline-block";

    }

}

// ---------------------------
// 로그인 확인
// ---------------------------

function requireLogin() {

    if (!currentUser) {

        alert("로그인이 필요합니다.");

        return false;

    }

    return true;

}

// ---------------------------
// 현재 사용자
// ---------------------------

function getUser() {

    return currentUser;

}

// ===========================================
// Auth 시작
// ===========================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log("auth 초기화 시작");

        initAuth();

    }
);