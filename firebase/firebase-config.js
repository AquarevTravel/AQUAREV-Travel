import {initializeApp} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig={
apiKey:"AIzaSyAycKfhrRV8qcbhvwj0NV5iE_4zlgcDyWo",
authDomain:"aquarev-travel.firebaseapp.com",
projectId:"aquarev-travel",
storageBucket:"aquarev-travel.firebasestorage.app",
messagingSenderId:"396344577424",
appId:"1:396344577424:web:be477d67f13f7a99e27715"
};

const app=initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db=getFirestore(app);