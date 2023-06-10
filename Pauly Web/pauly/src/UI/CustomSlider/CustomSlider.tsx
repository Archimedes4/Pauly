// import React, { useEffect, useRef } from 'react';
// import styled from 'CustomSliderCSS.css';



// const DraggableCircle = () => {
//   const draggerRef = useRef(null);
//   const displayRef = useRef(null);
//   const upTextRef = useRef(null);
//   const downTextRef = useRef(null);
//   const tlRef = useRef(null);
//   let dragVal = 0;
//   const maxDrag = 300;



//   return (
//     <Container>
//       <Svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 600">
//         <defs>
//           <filter id="goo" colorInterpolationFilters="sRGB">
//             <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
//             <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" result="cm" />
//           </filter>
//         </defs>
//         <g id="dragGroup">
//           <path id="dragBar" fill="#FFFFFF" d="M447,299.5c0,1.4-1.1,2.5-2.5,2.5h-296c-1.4,0-2.5-1.1-2.5-2.5l0,0c0-1.4,1.1-2.5,2.5-2.5h296C445.9,297,447,298.1,447,299.5L447,299.5z" />
//           <g id="displayGroup">
//             <g id="gooGroup" filter="url(#goo)">
//               <circle id="display" fill="#FFFFFF" cx="146" cy="299.5" r="16" ref={displayRef} />
//               <circle id="dragger" fill="#FFFFFF" stroke="#03A9F4" strokeWidth="0" cx="146" cy="299.5" r="15" ref={draggerRef} />
//             </g>
//             <UpText className="upText" x="145" y="266" ref={upTextRef}>0</UpText>
//             <DownText className="downText" x="146" y="304" ref={downTextRef}>0</DownText>
//           </g>
//         </g>
//       </Svg>
//     </Container>
//   );
// };

// export default DraggableCircle;