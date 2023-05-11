"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCardContentContext = void 0;
const Cards_module_css_1 = require("./Cards.module.css");
const Cards_js_1 = require("./Cards.js");
const React = require("react");
const CardContentContext = React.createContext({ positionIn: { x: 0, y: 0 }, selectedElement: 0 });
function useCardContentContext() {
    return React.useContext(CardContentContext);
}
exports.useCardContentContext = useCardContentContext;
function CardSelectContent(item) {
    const { positionIn, selectedElement, setSelectedElementFunc } = useCardContentContext();
    // const setSelectedElementFunction = () => {
    //     setSelectedElement();
    // };
    const ref = React.useRef();
    // Monitor changes to position state and update DOM
    React.useEffect(() => {
        if (ref.current) {
            ref.current.style.transform = `translate(${positionIn.x}px, ${positionIn.y}px)`;
        }
    }, [positionIn]);
    const handleOnClick = (e, Index) => {
        e.preventDefault();
        setSelectedElementFunc(Index);
        console.log(selectedElement);
    };
    return (<div ref={ref} style={{
            width: "200px",
            height: "200px",
            background: "#FF9900",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: { selectedElement, : .current === item.ElementIndex } ? "none" : "5px solid red"
        }}>
            <button key={item.ElementIndex} onClick={e => handleOnClick(e, item.ElementIndex)}>
                {(() => {
            switch (item.ElementType) {
                case "Text": return <p> {item.Content} </p>;
                case "Shape": return <div style={{ height: "50px", width: "50px", backgroundColor: "#555" }}> </div>;
                case "Image": return <p> Test </p>;
                case "Button": return <p> {item.Content} </p>;
                default: return <p> {item.Content} </p>;
            }
        })()}
            </button>
        </div>);
}
function CardContent() {
    const { components, zoomScale } = (0, Cards_js_1.useCardContext)();
    const [pressed, setPressed] = React.useState(false);
    const [position, setPosition] = React.useState({ positionIn: { x: 0, y: 0 }, selectedElement: 0 });
    const [selectedElementValue, setSelectedElement] = React.useState(0);
    // Update the current position if mouse is down
    const onMouseMove = (event) => {
        if (pressed) {
            setPosition({
                positionIn: {
                    x: position.positionIn.x + event.movementX,
                    y: position.positionIn.y + event.movementY
                },
                selectedElement: selectedElementValue
            });
        }
    };
    const setSelectedElementFunction = (Index) => {
        setSelectedElement(Index);
    };
    const value = {
        positionIn: position.positionIn,
        selectedElement: position.selectedElement,
        setSelectedElementFunc: setSelectedElementFunction
    };
    return (<div className={Cards_module_css_1.default.CardContentPlane}>
            <div className={Cards_module_css_1.default.CardContentAreaPlane} style={{ transform: 'scale(' + (zoomScale / 100) + ')' }} onMouseMove={onMouseMove} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}>
                {components === null || components === void 0 ? void 0 : components.map((item) => (<div style={{ zIndex: item.CurrentZIndex, position: "absolute", cursor: "move" }}> 
                    <CardContentContext.Provider value={value}>
                        <div>
                            <CardSelectContent {...item} key={item.ElementIndex}/>
                        </div>
                    </CardContentContext.Provider>       
                </div>))} 
            </div>
        </div>);
}
exports.default = CardContent;
//# sourceMappingURL=CardContent.jsx.map