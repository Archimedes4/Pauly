import React from 'react'
import { Link } from 'react-router-dom'

export default function Elections() {
  return (
    <div>
      <Link to="\government\">
        Back
      </Link>
      <p>Create Election</p>
      <p>Pick Start Date</p>
      <p>Pick End Date</p>
      <p>Hidden</p>
      <p>Voters</p>
      <div>
        <p>By Grade</p>
        <p>By Group</p>
        <p>By Class</p>
        <p>By Section</p>
      </div>
      <div>
        <p>Canadates</p>
        <p>Add Canadates</p>
      </div>
      <p>Create</p>
    </div>
  )
}
