import React from "react"
import { AuthProvider } from "../Contexts/AuthContext"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./Login"
import Home from "./Home"
import Government from "./Government"
import styles from "./AppStyles.module.css"
import Sports from "./Sports"
import Calendar from "./Calendar"
import Profile from "./Profile/Profile"
import Messaging from "./Messaging/Messaging"
import Quiz from "./Quiz"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className={styles.AppDiv}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/government/*' element={<Government />} />
            <Route path='/sports' element={<Sports />}/>
            <Route path='/calendar' element={<Calendar />}/>
            <Route path='/profile/*' element={<Profile />}/>
            <Route path='/messaging/*' element={<Messaging />}/>
            <Route path='/quiz' element={<Quiz />}/>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;