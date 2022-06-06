import React, { useRef, useState } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { RiCloseCircleLine } from "react-icons/ri";
import Footer from "./Footer";
require("dotenv").config();

const {
  REACT_APP_API_KEY,
  REACT_APP_AUTH_DOMAIN,
  REACT_APP_PROJECT_ID,
  REACT_APP_STORAGE_BUCKET,
  REACT_APP_MESSAING_SENDER_ID,
  REACT_APP_APP_ID,
  REACT_APP_MEASURMENT_ID,
} = process.env;

firebase.initializeApp({
  apiKey: REACT_APP_API_KEY,
  authDomain: REACT_APP_AUTH_DOMAIN,
  projectId: REACT_APP_PROJECT_ID,
  storageBucket: REACT_APP_STORAGE_BUCKET,
  messagingSenderId: REACT_APP_MESSAING_SENDER_ID,
  appId: REACT_APP_APP_ID,
  measurementId: REACT_APP_MEASURMENT_ID,
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const todoRef = firestore.collection("Todos");

function Todo() {
  const [user] = useAuthState(auth);

  return <section>{user ? <Todos /> : <SignIn />}</section>;
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
    auth.currentUser && (
      <button id="signOut" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function Todos() {
  const [formValue, setFormValue] = useState("");
  const [errorBox, setErrorBox] = useState(false);
  const [errorBoxs, setErrorBoxs] = useState(false);
  const [errorText, setErrorText] = useState(false);
  const query = todoRef.orderBy("createdAt").limit(25);
  const [todo] = useCollectionData(query, { idField: "id" });
  const user = firebase.auth().currentUser;
  const { uid } = auth.currentUser;

  const addTodo = async (long) => {
    await todoRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      longeur: long,
    });
  };

  //----------------------------------------------------SendTodo
  const sendTodo = async (e) => {
    const court = document.getElementById("courtTerme");
    const moyen = document.getElementById("moyenTerme");
    const long = document.getElementById("longTerme");

    e.preventDefault();
    const { uid } = auth.currentUser;
    //----------------------------------CheckBox
    if (court.checked && !moyen.checked && !long.checked && formValue !== "")
      addTodo("court");

    if (moyen.checked && !court.checked && !long.checked && formValue !== "")
      addTodo("moyen");

    if (long.checked && !court.checked && !moyen.checked && formValue !== "")
      addTodo("long");

    if (!long.checked && !moyen.checked && !court.checked) setErrorBox(true);
    else setErrorBox(false);

    if (
      (moyen.checked && court.checked) ||
      (moyen.checked && long.checked) ||
      (long.checked && court.checked) ||
      (court.checked && long.checked)
    )
      setErrorBoxs(true);
    else setErrorBoxs(false);

    if (formValue === "") setErrorText(true);
    else setErrorText(false);

    court.checked = false;
    moyen.checked = false;
    long.checked = false;
    setFormValue("");
  };

  //----------------------------------Delete
  const deleteTodo = async (tod) => {
    console.log(tod);
    todoRef.doc(tod.id).delete();
  };

  //----------------------------------Date
  const datePaser = (date) => {
    let newDate = new Date(date * 1000).toLocaleDateString("fr-FR");
    return newDate;
  };

  //----------------------------------DisplayTodo
  const displayTodo = (tod) => {
    if (tod.createdAt === null) {
      return (
        <div className="todoCard">
          <li draggable="true" data-draggable="item">
            <h4> {tod.text} </h4>
            <p> crée le {Date.now()} </p>
          </li>
          <RiCloseCircleLine
            onClick={() => deleteTodo(tod)}
            className="delete-icon"
          />
        </div>
      );
    } else {
      return (
        <div className="todoCard">
          <li draggable="true" data-draggable="item">
            <h4> {tod.text} </h4>
            <p> crée le {datePaser(tod.createdAt.seconds)} </p>
          </li>
          <RiCloseCircleLine
            onClick={() => deleteTodo(tod)}
            className="delete-icon"
          />
        </div>
      );
    }
  };
  //----------------------------------Display
  return (
    <>
      <div className="bar">
        <h1>ToDo List de {user.displayName}</h1>
        <SignOut />
      </div>

      {/* ------------------------Enter todo */}
      <div className="enterTodo">
        <form onSubmit={sendTodo}>
          <input
            id="TodoValue"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          {errorText && <p>Veuillez entrer un todo</p>}
          <div id="checkbox">
            <input type="checkbox" name="courtTerme" id="courtTerme"></input>
            <label htmlFor="courtTerme">Court terme</label>
            <input type="checkbox" name="moyenTerme" id="moyenTerme"></input>
            <label htmlFor="moyenTerme">Moyen terme</label>
            <input type="checkbox" name="longTerme" id="longTerme"></input>
            <label htmlFor="longTerme">Long terme</label>
            {errorBox && <p>Veuillez cocher une case</p>}
            {errorBoxs && <p>Veuillez cocher une seule case</p>}
          </div>

          <button type="submit" className="button">
            Envoyer
          </button>
        </form>
      </div>
      <div className="display">
        <div className="courtTerme">
          <h2>Court terme :</h2>
          {todo &&
            todo.map(
              (tod, i) =>
                tod.uid === uid &&
                tod.longeur === "court" && <div key={i}>{displayTodo(tod)}</div>
            )}
        </div>
        <div className="moyenTerme">
          <h2>Moyen terme :</h2>
          {todo &&
            todo.map(
              (tod, i) =>
                tod.uid === uid &&
                tod.longeur === "moyen" && <>{displayTodo(tod)}</>
            )}
        </div>
        <div className="longTerme">
          <h2>Long terme :</h2>
          {todo &&
            todo.map(
              (tod, i) =>
                tod.uid === uid &&
                tod.longeur === "long" && <div key={i}>{displayTodo(tod)}</div>
            )}
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default Todo;
