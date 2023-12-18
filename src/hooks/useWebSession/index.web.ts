/*
  Pauly
  Andrew Mainella
  1 Decemeber 2023
  useWebSession/index.web.ts
  main module for use webSession. useWebSession checks if their is a session storage of Pauly list to save api resources.
*/
import { paulyListSlice } from '../../Redux/reducers/paulyListReducer';
import store from '../../Redux/store';

// If true a web session had been found
export default function useWebSession() {
  function main() {
    const stringListItem =
      window && window.sessionStorage && sessionStorage.getItem('listStore');
    if (stringListItem !== null) {
      try {
        const parsedListItem: paulyListType = JSON.parse(stringListItem);
        store.dispatch(paulyListSlice.actions.setPaulyList(parsedListItem));
        return true;
      } catch {
        return false;
        // return nothing just don't fail
      }
    } else {
      return false;
    }
  }
  return main;
}
