import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkw1kL7AU73Y9FWrPZ-ERv5xFvXGGILBA",
  authDomain: "claritybudget-6lnmd.firebaseapp.com",
  projectId: "claritybudget-6lnmd",
  storageBucket: "claritybudget-6lnmd.firebasestorage.app",
  messagingSenderId: "40318182466",
  appId: "1:40318182466:web:c2ce0637f8f23afa95b9db",
};

const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

export { app, auth, db, googleProvider, serverTimestamp, firebase };
