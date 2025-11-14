"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css"; 
import zxcvbn from "zxcvbn";

function validatePassword(pw) {
  const errors = [];
// Owasp
  if (!pw || pw.length < 12) errors.push("Password must be at least 8 characters.");
  if (!/[a-z]/.test(pw)) errors.push("Must contain a lowercase letter.");
  if (!/[A-Z]/.test(pw)) errors.push("Must contain an uppercase letter.");
  if (!/[0-9]/.test(pw)) errors.push("Must contain a digit.");
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pw)) errors.push("Must contain a special character.");
  return errors;
}

export default function Profile() {
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [pwScore, setPwScore] = useState(null);
    const router = useRouter();
    const [open,setOpen] = useState(false)

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
      }
    }, [router]);

    useEffect(() => {
      if (newPass) {
        const result = zxcvbn(newPass);
        setPwScore(result.score);
      } else {
        setPwScore(null);
      }
    }, [newPass]);

  



// ---------------------------- Submit ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const clientErrors = validatePassword(newPass);
    if (clientErrors.length) {
        setMsg(clientErrors.join(" | "));
        return;
    }


    if (newPass !== confirmPass) {
        setMsg("Passwords do not match");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        setMsg("You must be logged in to change your password");
        return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:5000/auth/change-password", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          old_password: currentPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMsg("Password changed successfully");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setMsg(data.message || "Error changing password");
      }
    } catch (err) {
      console.error(err);
      setMsg("Network error - Please check your connection");
    } finally {
      setLoading(false);
    }
  };

//   check password color 
    const getPwColor = (score) => {
    switch(score) {
      case 0: return "red";
      case 1: return "orange";
      case 2: return "yellow";
      case 3: return "lightgreen";
      case 4: return "green";
      default: return "transparent";
    }
  };

  const getPwText = (score) => {
    switch(score) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Strong";
      case 4: return "Very Strong";
      default: return "";
    }
  };

  return (
    <main className={styles.main}>

      <title>Profile</title>

      <nav className={styles.nav}>
                <p>Profile</p>
                <div>
                  <Link href="../dashboard">dashboard</Link>|{" "}
                  <Link href="../upload">Upload Logs</Link>  
                </div>
      </nav>

      <div className={styles.headers}>
        <h1>User Profile</h1>
        <p>Change your password below:</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formBox}>
        <label>Current Password</label>
        <input
          type="password"
          value={currentPass}
          onChange={(e) => setCurrentPass(e.target.value)}
          required
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          required
          minLength={6}
        />
        {pwScore !== null && (
          <div style={{ margin: "5px 0" }}>
            <div style={{
              width: `${(pwScore + 1) * 20}%`,
              height: "8px",
              backgroundColor: getPwColor(pwScore),
              transition: "width 0.3s"
            }}></div>
            <span style={{ fontSize: "0.9em" }}>{getPwText(pwScore)}</span>
          </div>
        )}
        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        
        {msg && (
          <p style={{ 
            color: msg.includes("successfully") ? "green" : "red",
            marginTop: "10px" 
          }}>
            {msg}
          </p>
        )}
      </form>
    </main>
  );
}