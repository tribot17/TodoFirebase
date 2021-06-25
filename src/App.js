import React, { useRef, useState } from "react";
import "./App.css";
import "./Styles/index.scss";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { RiCloseCircleLine } from "react-icons/ri";

firebase.initializeApp({
  apiKey: "AIzaSyBWYOFNLC_jybJdh3j9HEO4BBU5HwCKP3A",
  authDomain: "monsite-20cf3.firebaseapp.com",
  projectId: "monsite-20cf3",
  storageBucket: "monsite-20cf3.appspot.com",
  messagingSenderId: "809901931791",
  appId: "1:809901931791:web:203e9cab2d1aed499e127a",
  measurementId: "G-404D3CY1V3",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>{user ? <Todo /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="login">
      <button onClick={signInWithGoogle}>Connectez vous avec Google</button>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function Todo() {
  const dummy = useRef();
  const todoRef = firestore.collection("Todos");
  const query = todoRef.orderBy("createdAt").limit(25);

  const [todo] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");
  const user = firebase.auth().currentUser;
  const { uid } = auth.currentUser;
  const sendTodo = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;

    await todoRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
    });

    setFormValue("");
  };

  const deleteTodo = async (tod) => {
    console.log(tod.id);
    todoRef.doc(tod.id).delete();
  };
  console.log(uid);
  return (
    <>
      <h1>ToDo List de {user.displayName}</h1>
      <div className="todo">
        <div id="display">
          {todo &&
            todo.map((tod) => {
              return tod.uid === uid ? (
                <div>
                  <li>{tod.text}</li>
                  <RiCloseCircleLine
                    onClick={() => deleteTodo(tod)}
                    className="delete-icon"
                  />
                </div>
              ) : (
                <div></div>
              );
            })}
        </div>
        <form onSubmit={sendTodo}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <br />
          <button type="submit" className="button">
            Envoyer
          </button>
        </form>
      </div>
    </>
  );
}

function TodoDisplay(props) {
  const { text, uid } = props.todo;

  const todoClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div>
      <p>todo : {text} </p>
    </div>
  );
}

export default App;
