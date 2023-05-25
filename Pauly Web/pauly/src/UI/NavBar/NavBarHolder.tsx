import React, { ReactNode, useState } from 'react'
import styles from "./NavBar.module.css"

export default function({children, selectedIndex, onSelectedIndexChange, width}:{children: ReactNode, selectedIndex: number, onSelectedIndexChange: (newIndex: number) => void, width: string}) {
    const [selectedValue, setSelectedValue] = useState(selectedIndex);

    return (
    <div style={{height: "100%", overflow: "hidden"}}>
        {
            React.Children.map(children, (child, index) =>
            <button style={{width: width }} className={styles.ChildrenBody} onClick={() => {
                setSelectedValue(index); 
                onSelectedIndexChange(index)
            }}>
                <React.Fragment>
                    {child}
                </React.Fragment>
            </button>
            )
        }
        <div style={{transform: 'translate3d(' + selectedValue * 100 + '%,0,0)', width: width }} className={styles.underline}> </div>
    </div>
    )
}
