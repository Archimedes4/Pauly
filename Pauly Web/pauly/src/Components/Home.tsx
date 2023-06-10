import React, {useEffect, useState} from 'react'
import { Link } from "react-router-dom"
import {doc, getDoc} from "firebase/firestore"
import TinyMCETextEditor from './Government/Cards/LexicalFunctions/TinyMCETextEditor';
// import CustomSlider from '../UI/CustomSlider/CustomSlider';

export default function Home() {
  return(
    <div style={{width: "100vw", height: "100vh"}}>
      <p>Home</p>
      <Link to="/government">  Government </Link>
      {/* <CustomSlider /> */}
    </div>
  );
}