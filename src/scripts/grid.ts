class Point {
    pos: [number, number];
    isFixed: boolean;
    isMidpoint: boolean;
    /**
     * 0 is right, 6 directions goint CCW
     * NOTE: does not store HE for any incident to a center vertex
     */
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

    /**
     * Returns the average of all points on the perimeter
     */
    centerPoint(): [number, number] {
        const middlePos: [number, number] = [0, 0];
        const oriEdge = this.edge;
        let tempEdge = oriEdge;
        let count = 0;
        do {
            middlePos[0] += tempEdge.a.pos[0];
            middlePos[1] += tempEdge.a.pos[1];
            tempEdge = tempEdge.next;
            count++;
        } while (tempEdge != oriEdge);
        middlePos[0] /= count;
        middlePos[1] /= count;
        return middlePos;
    }

    pointList(): Point[] {
        const res = [];
        let tempEdge = this.edge;
        do {
            res.push(tempEdge.a);
            tempEdge = tempEdge.next;
        } while (tempEdge != this.edge);
        return res;
    }
}

class DCEL {
    points: Set<Point>;
    halfEdges: Set<HalfEdge>;
    faces: Set<Face>;
    extFace: Face;

    constructor() {
        this.points = new Set();
        this.halfEdges = new Set();
        this.faces = new Set();
        this.extFace = new Face(true);
        this.faces.add(this.extFace);
    }
}

export class GridGenerator {
    hexagonSideLen: number;
    unitLen: number;
    width: number;

    dcel: DCEL;

    /**
     * DO NOT USE WITH HEXAGONSIDELEN = 1
     */
    constructor(hexagonSideLen: number, unitLen: number) {
        this.hexagonSideLen = hexagonSideLen;
        this.unitLen = unitLen;
        this.width = 2 * hexagonSideLen - 1;
        this.dcel = new DCEL();
        this.makeHexGrid();
        this.joinRandomTriangles(0.7);
        this.subdivideEdges();
        this.subdivideFaces();
        this.relaxPoints(75, 0.00005);
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
                // const fixed =
                //     (j == 0 || j == pointsInRow - 1) &&
                //     (i == 0 || i == this.hexagonSideLen || i == this.width - 1);
                const fixed =
                    j == 0 ||
                    j == pointsInRow - 1 ||
                    i == 0 ||
                    i == this.width - 1;
                //initialize point pos
                points[curPointInd] = new Point(xOffset, yOffset, fixed);
                const curPoint = points[curPointInd];
                this.dcel.points.add(curPoint);

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
                        this.dcel.halfEdges.add(curToO);
                        oPoint.halfEdges[oToCurDir] = oToCur;
                        this.dcel.halfEdges.add(oToCur);

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

                    this.dcel.faces.add(triangle);
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

        this.assertValidDcel();
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
            successfulDelete &&= this.dcel.faces.delete(oFace);
            successfulDelete &&= this.dcel.halfEdges.delete(curEdge);
            successfulDelete &&= this.dcel.halfEdges.delete(twinEdge);
            console.assert(successfulDelete, "Failed to delete something");

            count++;
        }

        console.assert(
            count == desiredMerges,
            "FAILED TO MERGE DESIRED MERGES",
            count,
            attempts,
            desiredMerges,
        );
        this.assertValidDcel();
    }

    private subdivideEdges() {
        //first create a middle point on each edge
        const seenEdges = new Set();
        const oldEdges = Array.from(this.dcel.halfEdges.values());
        oldEdges.forEach((vy) => {
            if (seenEdges.has(vy) || seenEdges.has(vy.twin)) {
                return;
            }
            seenEdges.add(vy);
            seenEdges.add(vy.twin);

            const uv = vy.prev;
            const yz = vy.next;
            const yv = vy.twin;
            const zy = yv.prev;
            const vu = yv.next;

            const v = vy.a;
            const y = vy.b;

            const x = new Point(
                (v.pos[0] + y.pos[0]) / 2,
                (v.pos[1] + y.pos[1]) / 2,
                v.isFixed && y.isFixed,
                true,
            );
            this.dcel.points.add(x);

            const vx = new HalfEdge(v, x);
            const xy = new HalfEdge(x, y);
            const yx = new HalfEdge(y, x);
            const xv = new HalfEdge(x, v);
            this.dcel.halfEdges.add(vx);
            this.dcel.halfEdges.add(xy);
            this.dcel.halfEdges.add(yx);
            this.dcel.halfEdges.add(xv);

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
            vx.face.edge = vx;
            yx.face.edge = yx;
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
        this.assertValidDcel();
    }

    private subdivideFaces() {
        const oldFaces = Array.from(this.dcel.faces.values());
        oldFaces.forEach((face) => {
            if (face.isExterior) return;
            const edgesStartingAtMidpoint = [];
            const oriEdge = face.edge;
            let curEdge = oriEdge;
            let edgeCount = 0;
            const middlePosition = [0, 0];
            const newFaces = [];
            do {
                if (curEdge.a.isMidpoint) {
                    edgesStartingAtMidpoint.push(curEdge);
                    newFaces.push(new Face());
                }
                middlePosition[0] += curEdge.a.pos[0];
                middlePosition[1] += curEdge.b.pos[1];
                // NOTE: DELETE THE FACE FOR NOW
                curEdge.face = null!;
                curEdge = curEdge.next;
                edgeCount++;
            } while (curEdge != oriEdge && edgeCount < 8);
            middlePosition[0] /= edgeCount;
            middlePosition[1] /= edgeCount;

            // NOTE: DELETE THE FACE FOR NOW
            this.dcel.faces.delete(face);

            console.assert(
                edgeCount == 8 || edgeCount == 6,
                "BAD EDGE SUBDIVIDE",
            );

            const a = new Point(middlePosition[0], middlePosition[1]);
            this.dcel.points.add(a);

            const faceSides = edgesStartingAtMidpoint.length;
            newFaces.forEach((face) => this.dcel.faces.add(face));
            const midEdgesXA = Array(faceSides);
            const midEdgesAX = Array(faceSides);

            for (let i = 0; i < faceSides; i++) {
                const xy = edgesStartingAtMidpoint[i];
                const x = xy.a;
                const vx = xy.prev;

                const xa = new HalfEdge(x, a);
                const ax = new HalfEdge(a, x);
                midEdgesAX[i] = ax;
                midEdgesXA[i] = xa;
                this.dcel.halfEdges.add(xa);
                this.dcel.halfEdges.add(ax);
                ax.twin = xa;
                xa.twin = ax;

                vx.next = xa;
                // xa.next = ax;
                ax.next = xy;
                xy.prev = ax;
                // ax.prev = xa;
                xa.prev = vx;
            }

            for (let i = 0; i < faceSides; i++) {
                midEdgesXA[i].next =
                    midEdgesAX[(i + faceSides - 1) % faceSides];
                midEdgesAX[(i + faceSides - 1) % faceSides].prev =
                    midEdgesXA[i];
            }

            for (let i = 0; i < edgesStartingAtMidpoint.length; i++) {
                const xy = edgesStartingAtMidpoint[i];
                const oriEdge = xy;
                let tempEdge = oriEdge;
                let faceCount = 0;
                do {
                    tempEdge.face = newFaces[i];
                    tempEdge = tempEdge.next;
                    newFaces[i].edge = tempEdge;
                    faceCount++;
                } while (tempEdge != oriEdge);

                console.assert(faceCount == 4, "BAD FACE", faceCount);
            }
        });

        this.assertValidDcel();
    }

    private relaxPoints(iterations: number, springConstant: number) {
        type KinematicInfo = {
            vel: [number, number];
            acc: [number, number];
        };
        const info: Map<Point, KinematicInfo> = new Map();
        this.dcel.points.forEach((point) => {
            info.set(point, { vel: [0, 0], acc: [0, 0] });
        });

        function applyForce(
            a: Point,
            b: Point,
            targetDist: number,
            constant: number,
        ) {
            if (a.isFixed && b.isFixed) return;
            const aToB = [b.pos[0] - a.pos[0], b.pos[1] - a.pos[1]];
            const dist = Math.sqrt(Math.pow(aToB[0], 2) + Math.pow(aToB[1], 2));
            const deltaD = dist - targetDist;
            const force = [
                aToB[0] * deltaD * constant,
                aToB[1] * deltaD * constant,
            ];
            // const double = a.isFixed || b.isFixed;
            // if (double) {
            //     // one of edges is stationary
            //     force[0] *= 2;
            //     force[1] *= 2;
            // }
            if (!a.isFixed) {
                info.get(a)!.acc[0] += force[0];
                info.get(a)!.acc[1] += force[1];
            }
            if (!b.isFixed) {
                info.get(b)!.acc[0] -= force[0];
                info.get(b)!.acc[1] -= force[1];
            }
        }

        for (let i = 0; i < iterations; i++) {
            // apply forces
            this.dcel.points.forEach((point) => {
                info.get(point)!.acc[0] = 0;
                info.get(point)!.acc[1] = 0;
            });
            const pointToAHE: Map<Point, HalfEdge> = new Map();
            const targetDist = this.unitLen / 2;
            this.dcel.halfEdges.forEach((he) => {
                if (he.face.isExterior) return;
                applyForce(he.a, he.b, targetDist, springConstant);
                pointToAHE.set(he.a, he);
            });

            this.dcel.points.forEach((point) => {
                const oPoints: Set<Point> = new Set();

                // find one edge to start the cycle of iteration, at least one edge should be in this array
                const oriEdge = pointToAHE.get(point)!;
                let tempEdge = oriEdge;
                //CW rotation of edges
                do {
                    console.assert(tempEdge!.a == point, "BAD EDGE");
                    if (!tempEdge.face.isExterior) {
                        // ROTATE AROUND CURRENT FACE ADD ALL POINTS,
                        let faceEdge = tempEdge;
                        do {
                            oPoints.add(faceEdge!.a);
                            faceEdge = faceEdge!.next;
                        } while (faceEdge != tempEdge);
                    }
                    // MOVE EDGE
                    tempEdge = tempEdge.twin.next;
                } while (tempEdge != oriEdge);
                oPoints.delete(point);

                oPoints.forEach((oPoint) => {
                    applyForce(point, oPoint, targetDist, springConstant * 2);
                });
            });

            // simulate
            this.dcel.points.forEach((point) => {
                const vel = info.get(point)!.vel;
                const acc = info.get(point)!.acc;
                vel[0] += acc[0]; // no delta time?
                vel[1] += acc[1];
                point.pos[0] += vel[0];
                point.pos[1] += vel[1];
            });
        }
    }

    private assertValidDcel() {
        this.dcel.halfEdges.forEach((he) => {
            console.assert(
                he.prev != null &&
                    he.next != null &&
                    he.face != null &&
                    he.twin != null,
                "BAD DCEL, NULL FIELD FOR EDGE",
                he,
            );
        });
        this.dcel.faces.forEach((face) => {
            console.assert(
                face.edge != null,
                "BAD DCEL, NULL FIELD FOR FACE",
                face,
            );
        });
    }
}
