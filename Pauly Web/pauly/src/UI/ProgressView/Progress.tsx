import React from 'react'
import styles from "./ProgressCSS.module.css"

export default function Progress({height}:{height: number}) {
  return (
    <div style={{height: height + "px", display: "table", margin: "auto", aspectRatio: "1/1", fontSize: height/8 + "px"}}>
      <div style={{height: height, display: "table-cell", verticalAlign: "middle"}}>
        <div style={{margin: "auto", width: "1em", height: "1em"}}>
          <span style={{}} className={styles.loader}></span>
        </div>
      </div>
    </div>
  )
}
