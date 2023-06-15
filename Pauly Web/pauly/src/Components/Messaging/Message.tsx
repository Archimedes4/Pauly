import React from 'react'
import { Link } from 'react-router-dom'

export default function Message() {
  return (
    <div>
        <Link to="/messaging">
            Back
        </Link>
        Message
    </div>
  )
}
