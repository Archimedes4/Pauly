import React, {useState} from 'react'
import { Link } from "react-router-dom"
import styles from "./AppStyles.module.css"
import SplashCheckmark from "../UI/SplashCheckmark/SplashCheckmark.tsx"
import Picker from "../UI/Picker/Picker"


export default function Home() {
  return(
    <div style={{width: "100vw", height: "100vh"}}>
      <p>Home</p>
      <Link to="/Government">  Government </Link>
      <Picker>
        <p>Test</p>
        <p>Test1</p>
      </Picker>
    </div>
  );
}