import { FSM } from "./FSM";
import * as transfo from "./transfo";


function multiTouch(element: HTMLElement): void {


    let pointerId_1: number, Pt1_coord_element: SVGPoint, Pt1_coord_parent: SVGPoint,
        pointerId_2: number, Pt2_coord_element: SVGPoint, Pt2_coord_parent: SVGPoint,
        originalMatrix: SVGMatrix,
        getRelevantDataFromEvent = (evt: TouchEvent): Touch => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches.item(i);
                if (touch.identifier === pointerId_1 || touch.identifier === pointerId_2) {
                    return touch;
                }
            }
            return null;
        };
    enum MT_STATES { Inactive, Translating, Rotozooming }
    let fsm = FSM.parse<MT_STATES>({
        initialState: MT_STATES.Inactive,
        states: [MT_STATES.Inactive, MT_STATES.Translating, MT_STATES.Rotozooming],
        transitions: [
            {
                from: MT_STATES.Inactive, to: MT_STATES.Translating,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    // Get the coordinates of the place where the user touches the screen
                    Pt1_coord_element = transfo.getPoint(evt.touches[0].clientX, evt.touches[0].clientY);
                    // calling getMatrixFromElement to get the svgMatrix corresponding to the element
                    originalMatrix = transfo.getMatrixFromElement(element);
                    // intiialise the parent coordinate to the element coordinate as explained in the course
                    Pt1_coord_parent = Pt1_coord_element;
                    return true;
                }
            },
            {
                from: MT_STATES.Translating, to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    // When dragging on the screen, the dragging point changes, getPoint lets us get these coordinates when touching
                    // the screen with one finger
                    Pt2_coord_parent = transfo.getPoint(evt.touches[0].clientX, evt.touches[0].clientY);
                    // We call drag method to resolve the equation explained in the course
                    transfo.drag(element, originalMatrix, Pt1_coord_element, Pt2_coord_parent);

                    return true;
                }
            },
            {
                from: MT_STATES.Translating,
                to: MT_STATES.Inactive,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    return true;
                }
            },
            {
                from: MT_STATES.Translating, to: MT_STATES.Rotozooming,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt: TouchEvent): boolean => {
                    // We get the coordinates of the second finger pressed on the screen
                    evt.preventDefault();
                    evt.stopPropagation();
                    Pt2_coord_element = transfo.getPoint(evt.touches[1].clientX, evt.touches[1].clientY);
                    return true;
                }
            },
            {
                from: MT_STATES.Rotozooming, to: MT_STATES.Rotozooming,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();

                    // We get the coordinates of the second finger mouving on the screen
                    Pt2_coord_parent = transfo.getPoint(evt.touches[1].clientX, evt.touches[1].clientY);
                    // We call the method rotozoom that resolves the equation explained in the course
                    transfo.rotozoom(element, originalMatrix, Pt1_coord_element, Pt1_coord_parent, Pt2_coord_element, Pt2_coord_parent);
                    return true;
                }
            },
            {
                from: MT_STATES.Rotozooming,
                to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    const touch = getRelevantDataFromEvent(evt);
                    evt.preventDefault();
                    evt.stopPropagation();
                    // To be completed
                    return true;
                }
            }
        ]
    });
    fsm.start();
}

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function isString(s: any): boolean {
    return typeof (s) === "string" || s instanceof String;
}

export let $ = (sel: string | Element | Element[]): void => {
    let L: Element[] = [];
    if (isString(sel)) {
        L = Array.from(document.querySelectorAll(<string> sel));
    } else if (sel instanceof Element) {
        L.push(sel);
    } else if (sel instanceof Array) {
        L = sel;
    }
    L.forEach(multiTouch);
};
