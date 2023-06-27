//Andrew Mainella
//Monday, June 26 2023
//Functions for uploading downloading and delteing card componetns

import { deleteDoc, doc, getDocs, setDoc, updateDoc, collection, Firestore } from "firebase/firestore"
import { UseAuth } from '../Contexts/AuthContext';
import { useEffect } from "react";
//Collection is the aspect mode the components are deleting

export async function addNewOnFierbase(item: CardElement, collectionID: string, selectedPageId: string, db: Firestore) {
  await setDoc(doc(db, "Pages", selectedPageId, collectionID, item.ElementUUID), {
    ElementType: item.ElementType,
    Content: item.Content,
    PositionX: item.Position.XPosition,
    PositionY: item.Position.YPosition,
    Width: item.Width,
    Height: item.Height,
    CurrentZIndex: item.CurrentZIndex,
    ElementIndex: item.ElementIndex,
    Opacity: item.Opacity,
    CornerRadius: item.CornerRadius,
    SelectedColor: item.SelectedColor,
    SelectedFont: item.SelectedFont,
    ElementUUID: item.ElementUUID
  })
}

export async function updateOnFierbase(item: CardElement, collectionID: string, selectedPageId: string, db: Firestore) {
  await updateDoc(doc(db, "Pages", selectedPageId, collectionID, item.ElementUUID), {
    ElementType: item.ElementType,
    Content: item.Content,
    PositionX: item.Position.XPosition,
    PositionY: item.Position.YPosition,
    Width: item.Width,
    Height: item.Height,
    CurrentZIndex: item.CurrentZIndex,
    ElementIndex: item.ElementIndex,
    Opacity: item.Opacity,
    CornerRadius: item.CornerRadius,
    SelectedColor: item.SelectedColor,
    SelectedFont: item.SelectedFont,
    ElementUUID: item.ElementUUID
  })
}

export async function deleteOnFirebase(item: CardElement, collectionID: string, selectedPageId: string, db: Firestore) { 
  await deleteDoc(doc(db, "Pages", selectedPageId, collectionID, item.ElementUUID))
}

export async function loadFromFirebase(collectionID: string, selectedPageId: string, db: Firestore): Promise<CardElement[]> {
  var result: CardElement[] = []
  const snapshotSmall = await getDocs(collection(db, "Pages", selectedPageId, collectionID))
  snapshotSmall.forEach((doc) => {
    console.log(doc.id, " =    ", doc.data());
    const data = doc.data()
    result.push({
      ElementType: data.ElementType,
      Content: data.Content,
      Position: {
        XPosition: data.PositionX,
        YPosition: data.PositionY
      },
      Width: data.Width,
      Height: data.Height,
      CurrentZIndex: data.CurrentZIndex,
      ElementIndex: data.ElementIndex,
      Opacity: data.Opacity,
      CornerRadius: data.CornerRadius,
      SelectedColor: data.SelectedColor,
      SelectedFont: data.SelectedFont,
      ElementUUID: data.ElementUUID
    })
  })
  return result
}