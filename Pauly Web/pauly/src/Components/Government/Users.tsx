import React from 'react'
import { Link } from 'react-router-dom'
import { Stack } from 'react-bootstrap'

export default function Users() {
  return (
    <div>
        <Stack>
            Users
            <Link to='/government/'>Back</Link>
            <button>
                Create Users
            </button>
        </Stack>
    </div>
  )
}
