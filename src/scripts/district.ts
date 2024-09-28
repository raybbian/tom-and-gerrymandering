import { GameState } from "./game_state";
import { exteriorHEOfFaces, Face } from "./grid";

/**
 * Returns the indices of all districts that are disconnected
 */
export function validateBadDistricts(state: GameState): number[] {
    const badDistricts: number[] = [];
    state.districts.entries().forEach(([districtInd, districtSet]) => {
        const cellsFaces = Array.from(districtSet).map(
            (ind) => state.cells[ind].dcelFace,
        );
        const faceSet = new Set(cellsFaces);

        function dfs(face: Face) {
            if (!faceSet.has(face)) return;
            faceSet.delete(face);
            let edge = face.edge;
            do {
                dfs(edge.twin.face);
                edge = edge.next;
            } while (edge != face.edge);
        }
        dfs(cellsFaces[0]);

        if (faceSet.size != 0) {
            badDistricts.push(districtInd);
        }
    });
    return badDistricts;
}

/**
 * Returns sum of distances of all points on outer face to the center point
 */
export function determineDistrictSusness(
    state: GameState,
    districtInd: number,
): number | null {
    const districtSet = state.districts.get(districtInd)!;
    if (districtSet == null) return null;
    const districtfaces = Array.from(districtSet.values()).map(
        (ind) => state.cells[ind].dcelFace,
    );
    const extHE = exteriorHEOfFaces(districtfaces);
    if (extHE.length == 0) return null;
    const centerPos: [number, number] = [0, 0];
    let count = 0;
    extHE.forEach((he) => {
        count++;
        centerPos[0] += he.a.pos[0];
        centerPos[1] += he.a.pos[1];
    });
    centerPos[0] /= count;
    centerPos[1] /= count;

    function eucDist(a: [number, number], b: [number, number]) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }
    let avgDist = 0;
    extHE.forEach((he) => {
        const point = he.a;
        avgDist += eucDist(point.pos, centerPos);
    });
    avgDist /= count;

    let totalDelta = 0;
    extHE.forEach((he) => {
        const dist = eucDist(he.a.pos, centerPos);
        totalDelta += Math.abs(dist - avgDist);
    });
    return totalDelta / count;
}
