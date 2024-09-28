class Point {
    pos: [number, number];
    isFixed: boolean;
    isMidpoint: boolean;
    halfEdges: (HalfEdge | null)[];

    constructor(
        x: number,
        y: number,
        isFixed: boolean = false,
        isMidpoint: boolean = false,
    ) {
        this.pos = [x, y];
        this.isFixed = isFixed;
        this.isMidpoint = isMidpoint;
        this.halfEdges = Array(6).fill(null);
    }
}

class HalfEdge {
    a: Point;
    b: Point;
    twin: HalfEdge = null!;
    prev: HalfEdge = null!;
    next: HalfEdge = null!;
    face: Face = null!;

    constructor(a: Point, b: Point) {
        this.a = a;
        this.b = b;
    }
}

class Face {
    edge: HalfEdge = null!;
    isExterior: boolean;

    constructor(isExterior: boolean = false) {
        this.isExterior = isExterior;
    }
}

class DCEL {
    points: Map<Point, Point>;
    halfEdges: Map<HalfEdge, HalfEdge>;
    faces: Map<Face, Face>;
    extFace: Face;

    constructor() {
        this.points = new Map();
        this.halfEdges = new Map();
        this.faces = new Map();
        this.extFace = new Face(true);
        this.faces.set(this.extFace, this.extFace);
    }
}

export class GridGenerator {
    hexagonSideLen: number;
    unitLen: number;
    width: number;

    dcel: DCEL;

    constructor(hexagonSideLen: number, unitLen: number) {
        this.hexagonSideLen = hexagonSideLen;
        this.unitLen = unitLen;
        this.width = 2 * hexagonSideLen - 1;
        this.dcel = new DCEL();
        this.makeHexGrid();
        this.joinRandomTriangles(0.6);
        // this.subDivideFaces();
    }

    private makeHexGrid() {
        const numPoints =
            this.width * (this.width + 1) -
            (this.hexagonSideLen - 1) * this.hexagonSideLen -
            this.width;

        let curPointInd = 0;
        const points: Point[] = Array(numPoints);

        for (let i = 0; i < this.width; i++) {
            const pointsInRow =
                this.width - Math.abs(i - Math.floor(this.width / 2));

            let xOffset = ((1 - pointsInRow) / 2) * this.unitLen;
            const yOffset =
                (((Math.floor(this.width / 2) - i) * this.unitLen) / 2) *
                Math.sqrt(3);
            for (let j = 0; j < pointsInRow; j++) {
                //initialize point pos
                points[curPointInd] = new Point(xOffset, yOffset);
                const curPoint = points[curPointInd];
                this.dcel.points.set(curPoint, curPoint);

                xOffset += this.unitLen;

                const hasLeft = j > 0;
                const lowerHalfOffset = (Math.sign(this.width / 2 - i) - 1) / 2; // -1 if point in lower half, 0 otherwise
                const hasUpLeft = i > 0 && (j > 0 || lowerHalfOffset < 0); // if lower half offset < 0, then point is in lower half, so always has
                const hasUpRight =
                    i > 0 && (j < pointsInRow - 1 || lowerHalfOffset < 0);

                const upLeftPoint = curPointInd - pointsInRow + lowerHalfOffset;
                const upRightPoint =
                    curPointInd - pointsInRow + lowerHalfOffset + 1;
                const leftPoint = curPointInd - 1;

                const edgeChecks: [boolean, number, number, number][] = [
                    [hasUpLeft, upLeftPoint, 2, 5],
                    [hasUpRight, upRightPoint, 1, 4],
                    [hasLeft, leftPoint, 3, 0],
                ];

                // initialize point halfedge array, halfedge init, halfedge twin
                edgeChecks.forEach(
                    ([hasDirection, oPointInd, curToODir, oToCurDir]) => {
                        if (!hasDirection) return;
                        const oPoint = points[oPointInd];
                        const curToO = new HalfEdge(curPoint, oPoint);
                        const oToCur = new HalfEdge(oPoint, curPoint);

                        curPoint.halfEdges[curToODir] = curToO;
                        this.dcel.halfEdges.set(curToO, curToO);
                        oPoint.halfEdges[oToCurDir] = oToCur;
                        this.dcel.halfEdges.set(oToCur, oToCur);

                        oToCur.twin = curToO;
                        curToO.twin = oToCur;
                    },
                );

                const triangleChecks: [boolean, number][] = [
                    [hasUpLeft && hasUpRight, 1],
                    [hasUpLeft && hasLeft, 2],
                ];

                // initialize face, halfedge next & prev, halfedge face, face edge
                triangleChecks.forEach(([hasTriangle, ind1]) => {
                    if (!hasTriangle) return;
                    const triangle = new Face();

                    const edge1 = curPoint.halfEdges[ind1];
                    if (edge1 == null) throw new Error("BAD DCEL");
                    const edge2 = edge1.b.halfEdges[(ind1 + 2) % 6];
                    if (edge2 == null) throw new Error("BAD DCEL");
                    const edge3 = edge2.b.halfEdges[(ind1 + 4) % 6];
                    if (edge3 == null) throw new Error("BAD DCEL");

                    console.assert(
                        edge1.b == edge2.a &&
                            edge2.b == edge3.a &&
                            edge3.b == edge1.a,
                        "BAD DCEL",
                    );

                    edge1.next = edge2;
                    edge2.next = edge3;
                    edge3.next = edge1;
                    edge1.prev = edge3;
                    edge2.prev = edge1;
                    edge3.prev = edge2;
                    edge1.face = triangle;
                    edge2.face = triangle;
                    edge3.face = triangle;

                    triangle.edge = edge1;

                    this.dcel.faces.set(triangle, triangle);
                });

                curPointInd++;
            }
        }

        let oneOuterEdge: HalfEdge = null!;
        let minX = Infinity;
        this.dcel.halfEdges.forEach((edge) => {
            if (edge.face == null) {
                edge.face = this.dcel.extFace;
                if (edge.a.pos[0] < minX) {
                    minX = edge.a.pos[0];
                    oneOuterEdge = edge;
                }
            }
        });

        //one outer edge is starting at leftmost point going in direction 1
        let direction = 1;
        const originalEdge: HalfEdge = oneOuterEdge;
        this.dcel.extFace.edge = oneOuterEdge;
        do {
            let nextEdge: HalfEdge | null = oneOuterEdge.b.halfEdges[direction];
            while (nextEdge == null) {
                // no more in this direction, turn clockwise
                direction = (direction + 5) % 6;
                nextEdge = oneOuterEdge.b.halfEdges[direction];
            }
            oneOuterEdge.next = nextEdge;
            nextEdge.prev = oneOuterEdge;
            oneOuterEdge = nextEdge;
        } while (oneOuterEdge != originalEdge);

        this.dcel.halfEdges.forEach((he) => {
            console.assert(
                he.prev != null &&
                    he.next != null &&
                    he.face != null &&
                    he.twin != null,
                "BAD DCEL, NULL FIELD",
            );
        });
        this.dcel.faces.forEach((face) => {
            console.assert(face.edge != null, "BAD DCEL, NULL FIELD");
        });
    }

    private joinRandomTriangles(probability: number) {
        const desiredMerges = Math.floor(
            ((this.dcel.faces.size - 1) / 2) * probability,
        );

        const usedFaces = new Set();
        const okFaces = Array.from(this.dcel.faces.values()).filter(
            (face) => !face.isExterior,
        );

        let count = 0;
        let attempts = 0;
        while (count < desiredMerges && attempts < 2 * desiredMerges) {
            attempts++;
            const randomIndex = Math.floor(Math.random() * okFaces.length);
            const face = okFaces[randomIndex];

            if (usedFaces.has(face)) {
                okFaces[randomIndex] = okFaces[okFaces.length - 1];
                okFaces.pop();
                continue;
            }

            const halfEdges = [];
            let tempEdge = face.edge;
            for (let i = 0; i < 3; i++) {
                if (
                    !tempEdge.twin.face.isExterior &&
                    !usedFaces.has(tempEdge.twin.face)
                ) {
                    halfEdges.push(tempEdge);
                }
                tempEdge = tempEdge.next;
            }
            if (halfEdges.length == 0) {
                usedFaces.add(face);
                okFaces[randomIndex] = okFaces[okFaces.length - 1];
                okFaces.pop();
                continue;
            }

            const curEdge =
                halfEdges[Math.floor(Math.random() * halfEdges.length)];
            const twinEdge = curEdge.twin;

            // oFace gets deleted from options, curFace gets put in banned
            const oFace = twinEdge.face;

            usedFaces.add(face);
            usedFaces.add(oFace);

            const a = curEdge.a;
            const b = curEdge.b;
            a.halfEdges[a.halfEdges.indexOf(curEdge)] = null!;
            b.halfEdges[b.halfEdges.indexOf(curEdge)] = null!;
            a.halfEdges[a.halfEdges.indexOf(twinEdge)] = null!;
            b.halfEdges[b.halfEdges.indexOf(twinEdge)] = null!;

            // update LL property
            curEdge.prev.next = twinEdge.next;
            twinEdge.next.prev = curEdge.prev;
            twinEdge.prev.next = curEdge.next;
            curEdge.next.prev = twinEdge.prev;
            // update face pointer
            let newFaceCount = 0;
            const oriEdge = curEdge.prev;
            tempEdge = oriEdge;
            do {
                tempEdge.face = face;
                tempEdge = tempEdge.next;
                newFaceCount++;
            } while (tempEdge != oriEdge);

            console.assert(newFaceCount == 4, "MERGED FACE IS NOT QUAD");

            curEdge.twin = null!;
            twinEdge.twin = null!;
            oFace.edge = null!;

            // delete edges
            let successfulDelete = true;
            successfulDelete &&= this.dcel.halfEdges.delete(curEdge);
            successfulDelete &&= this.dcel.halfEdges.delete(twinEdge);
            console.assert(successfulDelete, "Failed to delete edges");

            count++;
        }

        console.assert(
            count == desiredMerges,
            "FAILED TO MERGE DESIRED MERGES",
            count,
            attempts,
            desiredMerges,
        );
    }

    private subDivideFaces() {
        //first create a middle point on each edge
        const seenEdges = new Set();
        this.dcel.halfEdges.forEach((vy) => {
            if (seenEdges.has(vy) || seenEdges.has(vy.twin)) {
                return;
            }
            seenEdges.add(vy);
            seenEdges.add(vy.twin);

            const uv = vy.prev;
            const yz = vy.next;
            const yv = vy.twin;
            const zy = yv.twin.prev;
            const vu = yv.twin.next;

            const v = vy.a;
            const y = vy.b;

            const x = new Point(
                (v.pos[0] + y.pos[0]) / 2,
                (v.pos[1] + y.pos[1]) / 2,
                false,
                true,
            );

            const vx = new HalfEdge(v, x);
            const xy = new HalfEdge(x, y);
            const yx = new HalfEdge(y, x);
            const xv = new HalfEdge(x, v);
            this.dcel.halfEdges.set(vx, vx);
            this.dcel.halfEdges.set(xy, xy);
            this.dcel.halfEdges.set(yx, yx);
            this.dcel.halfEdges.set(xv, xv);

            yx.twin = xy;
            xy.twin = yx;
            xv.twin = vx;
            vx.twin = xv;
            vx.face = vy.face;
            xy.face = vy.face;
            xv.face = yv.face;
            yx.face = yv.face;

            uv.next = vx;
            vx.next = xy;
            xy.next = yz;
            yz.prev = xy;
            xy.prev = vx;
            vx.prev = uv;

            zy.next = yx;
            yx.next = xv;
            xv.next = vu;
            vu.prev = xv;
            xv.prev = yx;
            yx.prev = zy;

            //delete vy, yv
            vy.face.edge = vx;
            yv.face.edge = yx;
            vy.twin = null!;
            yv.twin = null!;
            const vyDir = v.halfEdges.indexOf(vy);
            const yvDir = y.halfEdges.indexOf(yv);
            console.assert(
                vyDir != -1 && yvDir != -1,
                "Subdivided edge is bad",
            );
            v.halfEdges[vyDir] = vx;
            y.halfEdges[yvDir] = yx;
            let successfulDeletion = true;
            successfulDeletion &&= this.dcel.halfEdges.delete(vy);
            successfulDeletion &&= this.dcel.halfEdges.delete(yv);
            console.assert(successfulDeletion, "DELETED EDGES NOT IN DCEL");

            x.halfEdges[vyDir] = xy;
            x.halfEdges[yvDir] = xv;
        });
    }
}
