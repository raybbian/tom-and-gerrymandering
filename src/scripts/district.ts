import { GameState } from "./game_state";
import { exteriorHEOfFaces, Face } from "./grid";

/**
 * Returns the indices of all districts that are disconnected
 */
export function validateBadDistricts(
    state: GameState,
): number[] | "not all cells are in a district" {
    const badDistricts: number[] = [];
    let cellsInDistricts = 0;
    Array.from(state.districts.entries()).forEach(
        ([districtInd, districtSet]) => {
            cellsInDistricts += districtSet.size;
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
        },
    );
    if (cellsInDistricts != state.cells.length - 1) {
        console.log(
            "visited " + cellsInDistricts + " required " + state.cells.length,
        );
        return "not all cells are in a district";
    }
    return badDistricts;
}

/**
 * Returns total number of electoral votes given the current district allocation.
 */
export function countDistrictVotes(state: GameState): number {
    let totalVotes = 0;
    Array.from(state.districts.keys()).forEach((districtInd) => {
        const [districtVotesFor, districtVotesAgainst] = votesInDistrict(
            state,
            districtInd,
        );
        if (districtVotesFor >= districtVotesAgainst) {
            totalVotes++;
        }
    });
    return totalVotes;
}

export function votesInDistrict(
    state: GameState,
    districtInd: number,
): [number, number] {
    const districtSet = state.districts.get(districtInd)!;
    let districtVotesFor = 0;
    let districtVotesAgainst = 0;
    Array.from(districtSet.values()).forEach((e) => {
        districtVotesFor +=
            state.cells[e].truePopulation * state.cells[e].voterProportion;
        districtVotesAgainst +=
            state.cells[e].truePopulation *
            (1 - state.cells[e].voterProportion);
    });
    return [districtVotesFor, districtVotesAgainst];
}

/**
 * Returns total population in a district
 */
export function findDistrictVariation(state: GameState): number {
    const districtSums: number[] = [];
    let totalPopulation = 0;
    Array.from(state.districts.values()).forEach((districtSet) => {
        let districtSum = 0;
        Array.from(districtSet.values()).forEach((e) => {
            districtSum += state.cells[e].truePopulation;
        });
        totalPopulation += districtSum;
        districtSums.push(districtSum);
    });
    const mean = totalPopulation / state.districts.size;

    const squaredDifferences = districtSums.map((num) => {
        const difference = num - mean;
        return difference * difference;
    });

    const variance =
        squaredDifferences.reduce((acc, val) => acc + val, 0) /
        districtSums.length;
    console.log(districtSums);
    return variance;
}

/**
 * Returns sum of distances of all points on outer face to the center point
 */
export function determineBlobness(
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
