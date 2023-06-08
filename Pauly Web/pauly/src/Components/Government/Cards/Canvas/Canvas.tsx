// import {useOnDraw} from './CanvasHooks';
// import {getRef} from "../Toolbar"
// import React, { useRef, useImperativeHandle } from 'react';



// const Canvas = React.forwardRef(function Canvas({width, height}, ref) {

//     const inputRef = useRef(null)

//     useImperativeHandle(ref, // forwarded ref
//     function () {
//       return {
//         value() { inputRef.current?.toDataURL('image/jpeg') }
//       } // the forwarded ref value
//     }, [])


//     const {
//         setCanvasRef,
//         onCanvasMouseDown
//     } = useOnDraw(onDraw);

//     function onDraw(ctx, point, prevPoint) {
//         drawLine(prevPoint, point, ctx, '#000000', 5);
//     }

//     function drawLine(
//         start,
//         end,
//         ctx,
//         color,
//         width
//     ) {
//         start = start ?? end;
//         ctx.beginPath();
//         ctx.lineWidth = width;
//         ctx.strokeStyle = color;
//         ctx.moveTo(start.x, start.y);
//         ctx.lineTo(end.x, end.y);
//         ctx.stroke();

//         ctx.fillStyle = color;
//         ctx.beginPath();
//         ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
//         ctx.fill();

//     }

//     return(
//         <canvas
//             width={width}
//             height={height}
//             onMouseDown={onCanvasMouseDown}
//             style={canvasStyle}
//             ref={((e) => {setCanvasRef(e); console.log("REFY GIT")}) && ref}
//         />
//     );

// })

// export default Canvas;

// const canvasStyle = {
//     border: "1px solid black"
// }

import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, MouseEventHandler } from 'react';

const App = React.forwardRef(({width, height, selectedColor}:{width: string, height: string, selectedColor: string}, ref) => {
    const canvasRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
          // ... your methods ...
          async download()  {
            const result = await download()
            console.log("la la la a al a", result)
            return result
          },
          clear() {
            clear()
          }
        };
    }, []);

    const ctx = useRef(null);

    const [mouseDown, setMouseDown] = useState(false);
    const [lastPosition, setPosition] = useState({
        x: 0,
        y: 0
    });

    useEffect(() => {
        if (canvasRef.current) {
        ctx.current = canvasRef.current.getContext('2d');
        }
    }, []);

    const draw = useCallback((x: number, y: number) => {
        if (mouseDown) {
        ctx.current.beginPath();
        ctx.current.strokeStyle = selectedColor;
        ctx.current.lineWidth = 10;
        ctx.current.lineJoin = 'round';
        ctx.current.moveTo(lastPosition.x, lastPosition.y);
        ctx.current.lineTo(x, y);
        ctx.current.closePath();
        ctx.current.stroke();

        setPosition({
            x,
            y
        })
        }
    }, [lastPosition, mouseDown, selectedColor, setPosition])

    const download = async () => {
        const image = canvasRef.current.toDataURL('image/png');
        const blob = await (await fetch(image)).blob();
        const blobURL = URL.createObjectURL(blob);
        return blobURL
        // const link = document.createElement('a');
        // link.href = blobURL;
        // link.download = "image.png";
        // link.click();
    }

    const clear = () => {
        ctx.current.clearRect(0, 0, ctx.current.canvas.width, ctx.current.canvas.height)
    }

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        setPosition({
        x: e.clientX - canvasRef.current?.getBoundingClientRect().left,
        y: e.clientY - canvasRef.current?.getBoundingClientRect().top
        })
        setMouseDown(true)
    }

    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        setMouseDown(false)
    }

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        draw(e.clientX - canvasRef.current?.getBoundingClientRect().left, e.clientY - canvasRef.current?.getBoundingClientRect().top)
    }

    return (
        <div className="App">
        <canvas
            style={{
            border: "1px solid #000"
            }}
            width={width}
            height={height}
            ref={canvasRef}
            onMouseDown={(e) => {onMouseDown(e)}}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseMove={onMouseMove}
        />
        </div>
    );
})

export default App;