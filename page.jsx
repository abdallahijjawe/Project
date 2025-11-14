"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";


export default function home(){
    const router = useRouter();
    const [file,setFile] = useState();
    const [source,setSource] = useState("windows");
    const [msg,setMsg] = useState("");
    const [open,setOpen] = useState(false)

    useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/");
            }
        }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!file){
            setMsg("Please choose a file");
            return;
        }

        const formData = new FormData();
        formData.append("file",file);
        formData.append("source",source);
        
        
        const res = await fetch("http://127.0.0.1:5000/upload/",{
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        setMsg(data.message);
        
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0";
        router.push("/");
        };

    return(
        <main>
            <title>Uploads</title>
            
            <nav className={styles.nav}>
                <p>Upload Logs</p>
                <div>
                    <Link href="../dashboard ">Dashboard</Link> |{" "} 
                    <div className={styles.setting}>
                        <p onClick={() => setOpen(!open)}>Settings</p>
                        {open && (
                                <div className={styles.dropDown}>
                                    <Link href="../profile">Profile</Link>
                                    <p onClick={handleLogout}>Logout</p>
                                </div>)}
                    </div>        
                </div>
            </nav>
                
            <div className={styles.main}>
                

                <div className={styles.card}>

                    <h1>Upload Logs</h1>

                    <form onSubmit={handleSubmit}>
                        <select name="source" id="source" onChange={(e) => setSource(e.target.value)}>
                            <option value="windows">Windows</option>
                            <option value="linux">Linux</option>
                            <option value="web">Web</option>
                        </select>

                         <div className={styles.dropzone}>
                            <input type="file" id="file" hidden onChange={(e) => setFile(e.target.files[0])}/>
                            <label htmlFor="file" className={styles.uploadBtn}>
                              {file ? file.name : "Choose File"}
                            </label>
                         </div>
                         <button type="submit" className={styles.submitBtn}>Upload</button>
                    </form>
                    <p style={{color:"black"}}>{msg}</p>
                </div>
            </div>    
        </main>
    );
}