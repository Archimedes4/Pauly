import React, { useRef, useState } from 'react'
import { useAuth } from "../Contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { Form, Button, Card, Alert } from "react-bootstrap"
import microsoftIcon from "../images/MicrosoftLogo.png"

export default function Login() {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const { LoginPassword, LoginMicrosoft } = useAuth()
  const history = useNavigate()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handelPasswordLogin(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()

    try{
      setError("")
      setLoading(true)
      await LoginPassword(emailRef.current?.value, passwordRef.current?.value)
    } catch {
      setError("Failed to log in")
    }
    history("/")
    setLoading(false)
  }

  async function handelMicrosoftLogin(){
    try{
      setError("")
      setLoading(true)
      const result = LoginMicrosoft()
      console.log(result)
      history("/")
      setLoading(false)
    } catch {
      setError("Failed to log in")
    }
  }

  return (
    <>
      <div className="w-100 text-center mt-2" style={{backgroundColor: "#793033"}}>
        {error && <Alert variant="danger">{error}</Alert>}
        <h1>Login</h1>
        <Form onSubmit={handelPasswordLogin} style={{backgroundColor:  "#793033", width: "80vw"}}>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} required />
          </Form.Group>
          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} required />
          </Form.Group>
          <Button disabled={loading} className="w-100" type="submit">
            Log In
          </Button>
        </Form>
        <Button disabled={loading} className="w-100" onClick={handelMicrosoftLogin} style={{width: "80vw"}}>
          <img style={{maxWidth: "2vh", height: "auto"}} src={microsoftIcon} />
          <p style={{display: "inline", marginLeft: "2%", height: "2vh"}}>
            Login With Microsoft
          </p>
        </Button>
      </div>
    </>
  )
}
