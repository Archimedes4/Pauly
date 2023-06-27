import React from 'react'
import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <div>
      <Link to="/">
        Back
      </Link>
      Profile
      <div>
        <Link to="/profile/leaderboard" style={{display: "block"}}>
            leaderboard
        </Link>
        <Link to="/profile/commissions" style={{display: "block"}}>
            commissions
        </Link>
        <Link to="/profile/resources" style={{display: "block"}}>
            resources
        </Link>
        <Link to="/profile/elections" style={{display: "block"}}>
            elections
        </Link>
        <Link to="/profile/settings" style={{display: "block"}}>
            settings
        </Link>
      </div>
    </div>
  )
}