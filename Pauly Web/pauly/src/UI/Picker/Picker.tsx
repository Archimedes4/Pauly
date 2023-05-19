import React, {useState, ReactNode} from 'react';
import styles from './Picker.module.css'


interface PickerWrapperProps {
  selectedIndex: number;
  setIsPressed: () => void;
  children: ReactNode
}

const PickerWrapper: React.FC<PickerWrapperProps>  = ({  selectedIndex, setIsPressed, children }) => {
  const [selectedValue, setSelectedValue] = useState(selectedIndex);

  function setValue(newNumber: number){
    setSelectedValue(newNumber)
  }

  return (
    <div className={styles.SwitchButtonContainer}>
    {
        React.Children.map(children, (child, index) =>
        <button className={(selectedValue === index) ? (styles.SelectedButtonStyle):(styles.UnSelectedButtonStyle)} onClick={() => {setValue(index)}}>
            <React.Fragment>
                {child}
            </React.Fragment>
        </button>
        )
     }
    </div>
  );
};

export default PickerWrapper;

// (selectedValue === index) ?
// :styles.UnSelectedButtonStyle