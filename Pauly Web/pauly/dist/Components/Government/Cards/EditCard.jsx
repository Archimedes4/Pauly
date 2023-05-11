"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
// import { View } from 'react-native';
const textIcon_png_1 = require("../../../textIcon.png");
const React = require("react");
const Cards_js_1 = require("./Cards.js");
const CardContent_1 = require("./CardContent");
const Cards_module_css_1 = require("./Cards.module.css");
function EditCard() {
    const { SelectedCard, components, setComponents, zoomScale, setZoomScale } = (0, Cards_js_1.useCardContext)();
    const [isShowingUse, setIsShowingUse] = (0, react_1.useState)(false);
    const [isShowingContributers, setIsShowingContributers] = (0, react_1.useState)(false);
    const [isShowingMenu, setIsShowingMenu] = (0, react_1.useState)(false);
    const [isNavigateToDestinations, setIsNavigateToDestinations] = (0, react_1.useState)(false);
    const [opacityValue, setOpacityValue] = (0, react_1.useState)(100);
    const target = (0, react_1.useRef)(null);
    const [scrollDir, setScrollDir] = (0, react_1.useState)("scrolling down");
    function addComponent(e, newValue) {
        e.preventDefault();
        setComponents([...components, newValue]);
    }
    function setZoom(e) {
        setZoomScale(1.0);
    }
    (0, react_1.useEffect)(() => {
        const threshold = 0;
        let lastScrollY = window.pageYOffset;
        let ticking = false;
        const updateScrollDir = () => {
            const scrollY = window.pageYOffset;
            if (Math.abs(scrollY - lastScrollY) < threshold) {
                ticking = false;
                return;
            }
            setScrollDir(scrollY > lastScrollY ? "scrolling down" : "scrolling up");
            lastScrollY = scrollY > 0 ? scrollY : 0;
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollDir);
                ticking = true;
            }
        };
        window.addEventListener("scroll", onScroll);
        console.log(scrollDir);
        return () => window.removeEventListener("scroll", onScroll);
    }, [scrollDir]);
    if (isNavigateToDestinations === true) {
        return <react_router_dom_1.Navigate to="/government/cards/edit/destinations"/>;
    }
    return (<>
      <div>
        <div className={Cards_module_css_1.default.EditCardBottemView}>
          <react_bootstrap_1.Container fluid>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col className={Cards_module_css_1.default.TitleEditCard}>
                <h1 className={Cards_module_css_1.default.TitleEditCard}> Edit Card </h1>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col className='justify-content-right'>
                <react_router_dom_1.Link to="/government/cards" style={{ textDecoration: "none" }}>
                  <p className={Cards_module_css_1.default.EditCardBackButton}>
                    Back
                  </p>
                </react_router_dom_1.Link>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
            <react_bootstrap_1.Row>
              <react_bootstrap_1.Col>
                <react_bootstrap_1.Container className={Cards_module_css_1.default.CardContainterCSS}>
                  <react_bootstrap_1.Stack>
                    <div className={Cards_module_css_1.default.CardContainterCardCSS}>
                      <CardContent_1.default />
                    </div>
                    <div className={Cards_module_css_1.default.CardToolbarDiv}>
                      <react_bootstrap_1.Stack direction='horizontal' gap={3}>
                        <div>
                         <button onClick={setZoom}> {zoomScale}% </button> 
                        </div>
                        <input type="range" min="10" max="500" value={zoomScale} onChange={changeEvent => setZoomScale(changeEvent.target.value)} className={Cards_module_css_1.default.slider} id="myRange"/>
                        <button className={Cards_module_css_1.default.CardToolBarButton} onClick={e => addComponent(e, { ElementType: "Text", Content: "Text", XPosition: 0, YPosition: 0, Width: 100, Height: 100, CurrentZIndex: components.length + 1, ElementIndex: components.length + 1 })}>
                          <img src={textIcon_png_1.default} className={Cards_module_css_1.default.imgContainer}/>
                        </button> 
                        <button onClick={e => addComponent(e, { ElementType: "Image", Content: "Text", XPosition: 0, YPosition: 0, Width: 100, Height: 100, CurrentZIndex: components.length + 1, ElementIndex: components.length + 1 })}> Shapes </button> 
                        <button onClick={e => addComponent(e, { ElementType: "Shape", Content: "Text", XPosition: 0, YPosition: 0, Width: 100, Height: 100, CurrentZIndex: components.length + 1, ElementIndex: components.length + 1 })}> Image </button>
                        <button onClick={e => addComponent(e, { ElementType: "Button", Content: "Text", XPosition: 0, YPosition: 0, Width: 100, Height: 100, CurrentZIndex: components.length + 1, ElementIndex: components.length + 1 })}> Button </button>
                      </react_bootstrap_1.Stack>
                    </div>
                  </react_bootstrap_1.Stack>
                </react_bootstrap_1.Container>
              </react_bootstrap_1.Col>
              <react_bootstrap_1.Col xs={2}>
                <react_bootstrap_1.Container>
                  <react_bootstrap_1.Row>
                    <react_bootstrap_1.Button onClick={() => setIsNavigateToDestinations(true)}>
                      Destinations
                    </react_bootstrap_1.Button>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                    <p>Rounded Corners</p>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                    <p>Corner Radius</p>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                    <p>Opacity {opacityValue}%</p>
                    <input type="range" min="1" max="100" value={opacityValue} onChange={changeEvent => setOpacityValue(changeEvent.target.value)} className={Cards_module_css_1.default.slider} id="myRange"/>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                    <p> Hidden </p>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                  <react_bootstrap_1.Button variant="danger" ref={target} onClick={() => setIsShowingUse(!isShowingUse)}>
                    Edit Use
                  </react_bootstrap_1.Button>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                    <p>Contributers</p>
                  </react_bootstrap_1.Row>
                  <react_bootstrap_1.Row>
                    <p>Undo</p>
                  </react_bootstrap_1.Row>
                </react_bootstrap_1.Container>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.Row>
          </react_bootstrap_1.Container>
        </div>
        {isShowingUse ?
            <>
            <div className={Cards_module_css_1.default.EditCardTopView}>
              <div>
                <p> Edit Use </p>
                <p> Current Use: {SelectedCard.Use}</p>
                <react_bootstrap_1.Form.Label htmlFor="overlayUse">Use</react_bootstrap_1.Form.Label>
                <react_bootstrap_1.Form.Control id="overlayUse"/>
              </div>
            </div>
          </>
            : null}
      </div>
    </>);
}
exports.default = EditCard;
//# sourceMappingURL=EditCard.jsx.map