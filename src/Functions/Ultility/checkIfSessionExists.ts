import { paulyListSlice } from "../../Redux/reducers/paulyListReducer"
import store from "../../Redux/store"

export function getSession() {
  const stringListItem = window && window.sessionStorage && sessionStorage.getItem('listStore')
  if (stringListItem !== null) {
    try {
      const parsedListItem: paulyListType = JSON.parse(stringListItem);
      store.dispatch(paulyListSlice.actions.setPaulyList(parsedListItem))
    } catch {
      //return nothing just don't fail
    }
  }
}