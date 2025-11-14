"use client";
import styles from "./page.module.css";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const inputUser = useRef()
  const inputPass = useRef()
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    inputUser.current.value = "";
    inputPass.current.value = "";

    const res = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log("Response:", data);

    if(data.success){
      localStorage.setItem("token", data.token);
      router.push("/dashboard")
    } else{
      alert("Invalid credentials! ")
    }
  };
  


  return (
    <main className={styles.main}>

      <title>Sign In</title>
      


      <div className={styles.head1}>
        <h1>Log File Analysis</h1>
      </div>

      <form className={styles.forms} onSubmit={handleSubmit}>
        <input 
        ref={inputUser} placeholder="Username" type="text" 
        onChange={(e) => setUsername(e.target.value)}/> 
        
        <input 
        ref={inputPass} placeholder="Password" type="password" 
        onChange={(e) => setPassword(e.target.value)} />
        
        <button type="submit">Sign in</button>
      
      </form>

    </main>
    
  );
}