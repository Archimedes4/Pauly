import React, {useState} from 'react'
import { Link } from "react-router-dom"
import styles from "./AppStyles.module.css"
import SplashCheckmark from "../UI/SplashCheckmark/SplashCheckmark.tsx"


export default function Home() {
  return(
    <div style={{width: "100vw", height: "100vh"}}>
      <p>Home</p>
      <Link to="/Government">  Government </Link>
    </div>
  );
}