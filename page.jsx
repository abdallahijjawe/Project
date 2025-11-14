"use client";

import styles from "./page.module.css";
import LineChart from "../components/LineChart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function Home(){
    const router = useRouter();
    const [search,setSearch] = useState("");
    const [data,setData] = useState([])
    const [showConfirm, setShowConfirm] = useState(false);
    const [open,setOpen] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
        }
    }, [router]);

    const fetchData = async () =>{
            const res = await fetch("http://127.0.0.1:5000/dashboard/logs")
            const d = await res.json()
            let allE = [];        
            d.forEach((file) => {
                if (file.events && file.events.length > 0) {
                    file.events.forEach((row) => {
                        allE.push({
                            filename: file.filename,
                            source: file.source,
                            time: row.time ? new Date(row.time.$date).toLocaleString():"-",
                            event: row.event,
                            username: row.username,
                            ip: row.ip || "-",
                            anomaly: row.anomaly === -1 ? true : false
                        });
                    });
                }
            });
            setData(allE);
            };

    useEffect( () => {
        fetchData();

    },[])



    const matchCondition = (row, key, value, negate = false) => {
        let result = false;

        switch (key) {
            case "anomaly":
              const boolVal = value === "true";
              result = row.anomaly === boolVal;
              break;
            case "username":
               if (value.endsWith("*")) {
                  const base = value.slice(0, -1).toLowerCase();
                  result = row.username?.toLowerCase().includes(base);
              } else {
              result = row.username?.toLowerCase().trim() === value.trim();
              }
              break;
            case "ip":
              if (value.endsWith("*")) {
                  const base = value.slice(0, -1).toLowerCase();
                  result = row.ip?.toLowerCase().includes(base);
              } else {
                  result = row.ip?.toLowerCase().trim() === value.trim();
              }
                break;
            case "source":
                result = row.source?.toLowerCase().includes(value);
                break;
            case "filename":
                result = row.filename?.toLowerCase().includes(value);
                break;
            case "event":
                result = row.event?.toLowerCase().includes(value);
                break;
            case "time":
                result = row.time.toString().toLowerCase().includes(value.trim());
                break;
            default:
              result =
                row.filename?.toLowerCase().includes(value) ||
                row.source?.toLowerCase().includes(value) ||
                row.event?.toLowerCase().includes(value) ||
                row.username?.toLowerCase().includes(value) ||
                row.ip?.toLowerCase() === value;
                row.time.toString().toLowerCase().includes(value.trim())
        }

    return negate ? !result : result;
};

    const evaluateQuery = (row, query) => {
        const orParts = query.split(/\s+OR\s+/i);

        return orParts.some((orPart) => {
          const andParts = orPart.split(/\s+AND\s+/i);
        
          return andParts.every((andTerm) => {
            let term = andTerm.trim();
            let negate = false;

            if (/^NOT\s+/i.test(term)) {
              negate = true;
              term = term.replace(/^NOT\s+/i, "");
            }
        
            let [key, value] = term.includes(":") ? term.split(":") : [null, term];
            if (value) value = value.toLowerCase();
        
            return matchCondition(row, key, value, negate);
          });
        });
    };

    const filteredData = data.filter((row) => {
        if (!search.trim()) return true; 
        return evaluateQuery(row, search);
    });

    const downReport = async () => {
        const res = await fetch("http://127.0.0.1:5000/dashboard/report",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filteredData)
        })
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Security_Report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    const clearBtn = async () => {
        await fetch("http://127.0.0.1:5000/dashboard/clear", { method: "POST" });
        setData([]);
        setShowConfirm(false)
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0";
        router.push("/");
    };

    return(
        <main className={styles.main}>
            
            <title>Dashboard</title>

            <nav className={styles.nav}>
                <p>Dashboard</p>
                <div>
                    <Link href="../upload">Upload Logs</Link>|{" "} 
                    <div className={styles.setting}>
                        <p onClick={() => setOpen(!open)}>Settings</p>
                        {
                            open && (
                                <div className={styles.dropDown}>
                                    <Link href="../profile">Profile</Link>
                                    <p onClick={handleLogout}>Logout</p>
                                </div>
                            )
                        }
                    </div>
                   
                </div>

            </nav>

            <div className={styles.search}>

                <h1>New search</h1>
                <input type="text" placeholder="Enter to search" id="search"
                    onChange={(e) => setSearch(e.target.value)}
                />
                <p> ✔️ {filteredData.length} event shown </p>

                <button
                    className={styles.downReport}
                    onClick={downReport}
                > 🗄️ Download Report as PDF</button>

                <button
                    className={styles.clearBtn}
                    onClick={() => setShowConfirm(true)}
                > 🧹 Clear Dashboard</button>

                {showConfirm && (
                <div className={styles.confirmBox}>
                  <p> ⚠️ Are you sure you want to clear all dashboard data?</p>
                  <div className={styles.confirmActions}>
                    <button
                      className={styles.yesBtn}
                      onClick={clearBtn}
                    >
                      Yes, clear it
                    </button>
                    <button
                      className={styles.noBtn}
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                )}

            </div>

            <div className={styles.chart}>
                
                <LineChart data={filteredData} />
            </div>

            <div className={styles.details}>
                
            
                <div className={styles.event}>
                    <table>
                        
                        <thead>
                            <tr>
                            <th>Filename</th>
                            <th>Source</th>
                            <th>Time</th>
                            <th>Event</th>
                            <th>Username</th>
                            <th>IP</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                filteredData.length > 0 ?
                                filteredData.map((row,index) => (
                                    <tr key={index} style={{color:row.anomaly ? "red" : "black"}}>
                                        <td>{row.filename}</td>
                                        <td>{row.source}</td>
                                        <td>{row.time }</td>
                                        <td>{row.event}</td>
                                        <td>{row.username}</td>
                                        <td>{row.ip}</td>
                                    </tr>
                                )):(
                                    <tr>
                                        <td colSpan="6">No results found</td>
                                    </tr>
                                )
                            }
                        </tbody>

                    </table>
                </div>

            </div>
        </main>
    );
}