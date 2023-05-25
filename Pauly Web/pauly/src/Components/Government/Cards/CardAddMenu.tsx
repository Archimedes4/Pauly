import React, { useState } from 'react'
import { Button, Card, Stack } from 'react-bootstrap'
import styles from "./Cards.module.css"
import EditCardArea from './EditCardArea'

export default function CardAddMenu({onSetIsShowingCardsMenu}:{onSetIsShowingCardsMenu: (item: boolean) => void}) {
    const [isShowingCardAddMenu, setIsShowingCardAddMenu] = useState<boolean>(false)
    return (
        <div className={styles.ImageLibraryView}>
            <Card className={styles.ImageLibraryViewCard}>
            <Card.Title>
                <Stack direction='horizontal'>
                <h1 style={{textAlign: "left"}} className={styles.ImageLibraryViewTitle}>Cards</h1>
                { isShowingCardAddMenu ?  <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {setIsShowingCardAddMenu(false)}}>Back</Button>:
                    <Button variant="primary" style={{display: "flex", alignContent: "right", marginLeft: "auto", marginRight: "3%"}} onClick={() => {onSetIsShowingCardsMenu(false)}}>Close</Button>
                }
                </Stack>
            </Card.Title>
            <Card.Body>
                { isShowingCardAddMenu ? 
                <div>
                    <Card>
                        <p>Add New Card</p>
                    </Card>
                </div>:
                <div>
                    <Card>
                        <p>Cards</p>
                    </Card>
                    <Button onClick={() => {setIsShowingCardAddMenu(true)}}>
                        Add New
                    </Button>
                </div>
                }
            </Card.Body>
            </Card>
        </div>
    )
}
