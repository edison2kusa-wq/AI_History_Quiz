// Firebase 연결 설정

const firebaseConfig = {

apiKey: "AIzaSyCe_2oFkbMoHg4cPfn8GW2N7Ez_KbASguU",
authDomain: "history-quiz-30744.firebaseapp.com",
projectId: "history-quiz-30744",
storageBucket: "history-quiz-30744.firebasestorage.app",
messagingSenderId: "1066708680933",
appId: "1:1066708680933:web:ae49043b4c2e1e02a7140c",
measurementId: "G-HFNQHBRC86"

};



// Firebase 초기화

firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();
const auth = firebase.auth();