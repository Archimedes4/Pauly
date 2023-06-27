import React from 'react'
import { Link } from 'react-router-dom'
import CardsView from '../UI/CardsView/CardsView'

export default function Quiz() {
  return (
    <div>
      <Link to="/">
        Back
      </Link>
      <CardsView width='100vw' height='100vh' selectedPageID={1}/>
    </div>
  )
}
