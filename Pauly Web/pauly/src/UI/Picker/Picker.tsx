import React, {useState, ReactNode} from 'react';
import styles from './Picker.module.css'


interface PickerWrapperProps {
  selectedIndex: number;
  onSetSelectedIndex: (item: number) => void;
  children: ReactNode;
}

const PickerWrapper: React.FC<PickerWrapperProps>  = ({  selectedIndex, onSetSelectedIndex, children }) => {
  return (
    <>
      <div style={{display: "grid"}}>
        {
            React.Children.map(children, (child, index) =>
            <button className={styles.UnSelectedButtonStyle} style={{gridColumn: (index + 1)}} onClick={() => {onSetSelectedIndex(index)}}>
                <React.Fragment>
                    {child}
                </React.Fragment>
            </button>
            )
        }
        <div style={{padding: 0, margin: 0, gridColumn: 1, gridRow: 1, zIndex: 2}}>
          <div style={{transform: 'translate3d(' + selectedIndex * 100 + '%, ' + "0" + ',0)', height: "100%" }} className={styles.SelectedButtonStyle}></div>
        </div>
      </div>
    </>
  );
};

export default PickerWrapper;

// (selectedValue === index) ?
// :styles.UnSelectedButtonStyle