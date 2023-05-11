import React from "react"
import { AuthProvider } from "../Contexts/AuthContext"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./Login"
import Home from "./Home"
import Government from "./Government"
import styles from "./AppStyles.module.css"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className={styles.AppDiv}>
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/Government/*' element={<Government />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;