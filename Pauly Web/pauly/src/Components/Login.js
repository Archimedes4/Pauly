import React, { useRef, useState } from 'react'
import { useAuth } from "../Contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { Form, Button, Card, Alert } from "react-bootstrap"

export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { LoginPassword, LoginMicrosoft } = useAuth()
  const history = useNavigate()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handelPasswordLogin(e){
    e.preventDefault()

    try{
      setError("")
      setLoading(true)
      await LoginPassword(emailRef.current.value, passwordRef.current.value)
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
      LoginMicrosoft()
    } catch {
      setError("Failed to log in")
    }
    history("/")
    setLoading(false)
  }

  return (
    <>
    
      <div className="w-100 text-center mt-2" backgroundcolor="#793033">
        {error && <Alert variant="danger">{error}</Alert>}
        <h1>Login</h1>
        <Form onSubmit={handelPasswordLogin} backgroundcolor="#793033">
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
        <Button disabled={loading} className="w-100" onClick={handelMicrosoftLogin}>
          Login With Microsoft
        </Button>
      </div>
    </>
  )
}
