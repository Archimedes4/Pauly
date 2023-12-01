import { useMsal } from "@azure/msal-react";
import { paulyListSlice } from "../../Redux/reducers/paulyListReducer"
import store from "../../Redux/store"
import { useEffect } from "react";

export default function useWebSession() {
  function main() {
    const stringListItem = window && window.sessionStorage && sessionStorage.getItem('listStore')
    if (stringListItem !== null) {
      try {
        const parsedListItem: paulyListType = JSON.parse(stringListItem);
        store.dispatch(paulyListSlice.actions.setPaulyList(parsedListItem))
      } catch {
        console.log('failed to get list')
        //return nothing just don't fail
      }
    } else {
      console.log("list does not exist")
    }
  }
  useEffect(() => {
    main();
  }, [])
  return null;
}