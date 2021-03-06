let re_matrix = /^matrix\((.*), (.*), (.*), (.*), (.*), (.*)\)$/;

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
let idM = svg.createSVGMatrix();
idM.a = 1; idM.b = 0; idM.c = 0; idM.d = 1; idM.e = 0; idM.f = 0;

//______________________________________________________________________________________________________________________
export let setMatrixCoordToElement = (element: HTMLElement
    , a: number
    , b: number
    , c: number
    , d: number
    , e: number
    , f: number
) => {
    element.style.transform = "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")";
};

//______________________________________________________________________________________________________________________
export let setMatrixToElement = (element: HTMLElement, M: SVGMatrix) => {
    setMatrixCoordToElement(element, M.a, M.b, M.c, M.d, M.e, M.f);
};

//______________________________________________________________________________________________________________________
export let getMatrixFromString = (str: string): SVGMatrix => {
    let res = re_matrix.exec(str)
        , matrix = svg.createSVGMatrix()
        ;
    matrix.a = parseFloat(res[1]) || 1;
    matrix.b = parseFloat(res[2]) || 0;
    matrix.c = parseFloat(res[3]) || 0;
    matrix.d = parseFloat(res[4]) || 1;
    matrix.e = parseFloat(res[5]) || 0;
    matrix.f = parseFloat(res[6]) || 0;

    return matrix;
};

//______________________________________________________________________________________________________________________
export let getPoint = (x: number, y: number): SVGPoint => {
    let point = svg.createSVGPoint();
    point.x = x || 0;
    point.y = y || 0;
    return point;
};

//______________________________________________________________________________________________________________________
export let getMatrixFromElement = (element: Element): SVGMatrix => {
    return getMatrixFromString(window.getComputedStyle(element).transform || "matrix(1,1,1,1,1,1)");
};

//______________________________________________________________________________________________________________________
export let drag = (element: HTMLElement
    , originalMatrix: SVGMatrix
    , Pt_coord_element: SVGPoint
    , Pt_coord_parent: SVGPoint
) => {
    // These lines only apply the equations explained in the course to resolve (M’ x Pt_coord_élément = Pt_coord_parent’) 
    let e, f: number;
    e = Pt_coord_parent.x - originalMatrix.a * Pt_coord_element.x - originalMatrix.c * Pt_coord_element.y;
    f = Pt_coord_parent.y - originalMatrix.b * Pt_coord_element.x - originalMatrix.d * Pt_coord_element.y;
    let newMatrix = svg.createSVGMatrix();
    // newMatrix.a = originalMatrix.a;
    // newMatrix.b = originalMatrix.b;
    // newMatrix.c = originalMatrix.c;
    // newMatrix.d = originalMatrix.d;
    // newMatrix.e = e;
    // newMatrix.f = f;
    newMatrix = originalMatrix;
    newMatrix.e = e;
    newMatrix.f = f;

    setMatrixToElement(element, newMatrix);
};

//______________________________________________________________________________________________________________________
export let rotozoom = (element: HTMLElement
    , originalMatrix: SVGMatrix
    , Pt1_coord_element: SVGPoint
    , Pt1_coord_parent: SVGPoint
    , Pt2_coord_element: SVGPoint
    , Pt2_coord_parent: SVGPoint
) => {
    // Same as the previous method, we apply the equations explained in the course

    let newMatrix = svg.createSVGMatrix();
    let dx_n, dy_n, dx_p, dy_p: number;
    let s, c, e, f: number;

    dx_n = Pt2_coord_element.x - Pt1_coord_element.x;
    dy_n = Pt2_coord_element.y - Pt1_coord_element.y;

    dx_p = Pt2_coord_parent.x - Pt1_coord_parent.x;
    dy_p = Pt2_coord_parent.y - Pt1_coord_parent.y;

    if (dx_n === 0 && dy_n === 0) {
        return
    }
    if (dx_n === 0 && dy_n != 0) {
        s = -dx_p / dy_n;
        c = dy_p / dy_n;
    }
    if (dy_n === 0 && dx_n != 0) {
        s = dy_p / dx_n;
        c = dx_p / dx_n;
    }
    if (dy_n != 0 && dx_n != 0) {
        s = (dy_p / dy_n - dx_p / dx_n) / (dy_n / dx_n + dx_n / dy_n);
        c = (dx_p + s * dy_n) / dx_n;
    }

    e = Pt1_coord_parent.x - c * Pt1_coord_element.x + s * Pt1_coord_element.y;
    f = Pt1_coord_parent.y - s * Pt1_coord_element.x - c * Pt1_coord_element.y;

    newMatrix = originalMatrix;
    newMatrix.e = e;
    newMatrix.f = f;
    newMatrix.a = c;
    newMatrix.d = c;
    newMatrix.b = s;
    newMatrix.c = -s;


    setMatrixToElement(element, newMatrix);

};

