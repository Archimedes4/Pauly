import React from 'react'
import styles from "./ProgressCSS.module.css"

export default function Progress() {
  return (
    <div>
        <span className={styles.loader}></span>
    </div>
  )
}
