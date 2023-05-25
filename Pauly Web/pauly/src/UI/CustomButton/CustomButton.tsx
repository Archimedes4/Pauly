import React from 'react'
import styles from './CustomButton.module.css'

export default function CustomButton({content}:{content: string}) {
  return (
    <button className={styles.button64} role="button"><span className={styles.text}>{content}</span></button>
  )
}
