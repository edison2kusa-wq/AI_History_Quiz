// =====================================
// Firebase Config
// AI 한국사 심화 퀴즈
// =====================================

// Firebase SDK가 로드되었는지 확인
if (typeof firebase === "undefined") {
    throw new Error("Firebase SDK가 로드되지 않았습니다.");
}

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyCe_2oFkbMoHg4cPfn8GW2N7Ez_KbASguU",
authDomain: "history-quiz-30744.firebaseapp.com",
projectId: "history-quiz-30744",
storageBucket: "history-quiz-30744.firebasestorage.app",
messagingSenderId: "1066708680933",
appId: "1:1066708680933:web:ae49043b4c2e1e02a7140c",
measurementId: "G-HFNQHBRC86"
};

// Firebase 중복 초기화 방지
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 공통 객체
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore 설정
db.settings({
    ignoreUndefinedProperties: true
});

// 인증 유지
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
.then(() => {
    console.log("자동 로그인 활성화");
})
.catch((err) => {
    console.error(err);
});

// Timestamp 단축 함수
function serverTime() {
    return firebase.firestore.FieldValue.serverTimestamp();
}

// 증가 함수
function increment(num = 1) {
    return firebase.firestore.FieldValue.increment(num);
}

// 현재 로그인 사용자
function getCurrentUser() {
    return auth.currentUser;
}

// 로그인 여부
function isLogin() {
    return auth.currentUser != null;
}

// 관리자 여부
async function isAdmin() {

    const user = auth.currentUser;

    if (!user) return false;

    try {

        const doc = await db
            .collection("users")
            .doc(user.uid)
            .get();

        if (!doc.exists) return false;

        return doc.data().role === "admin";

    } catch (e) {

        console.error(e);

        return false;

    }

}

console.log("Firebase 연결 완료");
