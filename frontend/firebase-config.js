// Firebase 연결 설정

const firebaseConfig = {

    apiKey: "여기에 Firebase 값 입력",

    authDomain:
    "여기에 Firebase 값 입력",

    projectId:
    "여기에 Firebase 값 입력",

    storageBucket:
    "여기에 Firebase 값 입력",

    messagingSenderId:
    "여기에 Firebase 값 입력",

    appId:
    "여기에 Firebase 값 입력"

};



// Firebase 초기화

firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();
const auth = firebase.auth();