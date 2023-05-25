import React, {useState} from 'react'
import { Link } from "react-router-dom"
import styles from "./AppStyles.module.css"
import SplashCheckmark from "../UI/SplashCheckmark/SplashCheckmark.tsx"
import Picker from "../UI/Picker/Picker"
import HorizontalPicker from "../UI/NavBar/NavBarHolder"
import Progress from '../UI/ProgressView/Progress.tsx';

export default function Home() {
  const [selectedValue, setSelectedValue] = useState(1);
  return(
    <div style={{width: "100vw", height: "100vh"}}>
      <p>Home</p>
      <Link to="/Government">  Government </Link>
      <Picker>
        <p style={{margin: 0, padding: 0}}>Test</p>
        <p style={{margin: 0, padding: 0}}>Test1</p>
      </Picker>
    </div>
  );
}