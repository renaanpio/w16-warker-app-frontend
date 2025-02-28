import { Filter } from "../src/pages/Filter";
import firebase from "firebase/compat/app";
import { createContext, useState, useEffect, SetStateAction } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { auth } from "./services/firebase";

type UserFormat = {
  id: string;
  name: string;
  avatar: string | null;
};

type AuthContextType = {
  user: UserFormat | undefined;
  SignInWithGoogle: () => Promise<void>; //promise cuz it's async await and dont have return
};

//as any ignore typescript for this context
export const AuthContext = createContext({} as AuthContextType);

function App() {
  const [user, setUser] = useState<UserFormat>();

  //monitorando se ja existia algum login pre-feito pelo usuario
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, photoURL, uid } = user;
        if (!displayName || !photoURL) {
          throw new Error("Missing information from Google Account");
        }
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
      }
      return unsubscribe();
    });
  }, []);

  async function SignInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      const { displayName, photoURL, uid } = result.user;
      if (!displayName || !photoURL) {
        throw new Error("Missing information from Google Account");
      }
      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL,
      });
    }
  }

  return (
    <BrowserRouter>
      <div className="App">
        <AuthContext.Provider value={{ user, SignInWithGoogle }}>
          <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/home/filter" element={<Filter />}></Route>
          </Routes>
        </AuthContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;
