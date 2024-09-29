import { countDistrictVotes, determineDistrictSusness, validateBadDistricts } from "./district";
import { DCEL, Face, GridGenerator, HalfEdge } from "./grid";
import { PerlinNoise } from "./perlin";

class Cell {
    public population: 1 | 2 | 3;
    public truePopulation: number;
    public voterProportion: number;
    public district: number | null;
    public dcelFace: Face;
    constructor(
        population: 1 | 2 | 3,
        truePopulation: number,
        voterProportion: number,
        dcelFace: Face,
    ) {
        // an int: [1, 2, 3]
        this.population = population;
        this.truePopulation = truePopulation;
        // a float in the range [0, 1]
        this.voterProportion = voterProportion;
        // 0 if the cell is not part of a district, otherwise the district number it is part of
        this.district = null;
        this.dcelFace = dcelFace;
    }
}

export class GameState {
    public actionMode: "redistricting" | "campaigning";

    private dcel: DCEL;
    private faceToCell: Map<Face, Cell>;

    public cells: Cell[];
    // public currentCellSelection: number | null;
    // public mouseDown: boolean;
    // public currentDistrictSelection: number | null;
    public numDistricts: number;
    public maxDistricts: number;
    public currentDistrict: number;
    // (district number, Set<cells in the district>)
    public districts: Map<number, Set<number>>;

    perlinPopulation: PerlinNoise;
    perlinVoterDistribution: PerlinNoise;

    public totalElectoralVotes: number;
    public susness: number;

    constructor(grid: GridGenerator) {
        this.actionMode = "campaigning";

        this.perlinPopulation = new PerlinNoise(1, Math.random());
        this.perlinVoterDistribution = new PerlinNoise(1, Math.random());

        this.dcel = grid.dcel;
        this.faceToCell = new Map();

        this.cells = Array.from(grid.dcel.faces).map(
            (face) => {
                const center = face.centerPoint();

                let voterPopulation: 1 | 2 | 3 = 1;
                const noise = this.perlinPopulation.getNormalizedNoise(...center, 0, 1);
                if (noise > 0.73) {
                    voterPopulation = 3;
                }
                else if (noise > 0.5) {
                    voterPopulation = 2;
                }
                else {
                    voterPopulation = 1;
                }

                const voterProportion = this.perlinVoterDistribution.getNormalizedNoise(...center, .20, .80);
                const cell = new Cell(voterPopulation, noise, voterProportion, face);
                this.faceToCell.set(face, cell);
                return cell;
            }
        );

        // this.currentCellSelection = null;
        // this.mouseDown = false;
        // this.currentDistrictSelection = 0;
        this.numDistricts = 0;
        this.maxDistricts = 10;
        this.currentDistrict = 0;
        this.districts = new Map<number, Set<number>>();
        // for (let i = 1; i <= 200; i++) {
        //     this.districts.set(i, new Set());
        // }

        this.totalElectoralVotes = 0;
        this.susness = 0;
    }

    setActionMode(mode: "redistricting" | "campaigning") {
        this.actionMode = mode;
    }

    updateNumDistricts() {
        this.numDistricts = this.districts.size;
    }

    addCellToDistrict(cellIndex: number, district: number | null) {
        const previousDistrict = this.cells[cellIndex].district;
        console.log(district == null);
        if (previousDistrict != null) {
            this.districts.get(previousDistrict)!.delete(cellIndex);
            if (this.districts.get(previousDistrict)!.size == 0) {
                this.districts.delete(previousDistrict);
            }
        }
        this.cells[cellIndex].district = district;
        if (district != null) {
            // if (district > this.numDistricts) {
            //     if (this.numDistricts == this.maxDistricts) {
            //         console.log("districts at max")
            //         return;
            //     }
            // }
            console.log("attempting to get district " + district);
            const district_set = this.districts.get(district);
            if (district_set == null) {
                this.districts.set(district, new Set());
            }
            this.districts.get(district)!.add(cellIndex);
            console.log(
                "district size is: " + this.districts.get(district)!.size,
            );
        }
        this.updateNumDistricts()
    }

    removeCellFromDistrict(cellIndex: number) {
        const previousDistrict = this.cells[cellIndex].district;
        if (previousDistrict != null) {
            this.districts.get(previousDistrict)!.delete(cellIndex);
            if (this.districts.get(previousDistrict)!.size == 0) {
                this.numDistricts--;
            }
        }
        this.cells[cellIndex].district = null;
    }

    campaignInCell(cellIndex: number, probability: number = 1) {
        console.log("campaigning in cell " + cellIndex);
        const updateCellProportion = (cell: Cell, scale: number) => {
            const proportion = cell.voterProportion;
            cell.voterProportion = proportion + scale * probability * 0.5 * (1 - proportion)
        }
        const start = this.cells[cellIndex];

        const visited = new Set<Cell>();
        const stack: [Cell, number][] = [];
        visited.add(start);
        stack.push([start, 0]);
        while (stack.length != 0) {
            const [v, weight] = stack.pop()!;
            visited.add(v);
            updateCellProportion(v, 1 / (weight + 1));
            const initialEdge: HalfEdge = v.dcelFace.edge;
            let edge = initialEdge;
            do {
                const cell = this.faceToCell.get(edge.twin.face)!;
                if (!visited.has(cell) && (weight + 1 <= 2) && !cell.dcelFace.isExterior) {
                    stack.push([cell, weight + 1]);
                }
                edge = edge.next;
            } while (edge != initialEdge)
        }
    }

    updateSusness(): number {
        let susness = 0;
        for (let i = 1; i <= this.numDistricts; i++) {
            const newsusness = determineDistrictSusness(this, i)!;
            // console.log("susness for district " + i + " is " + newsusness);
            susness += newsusness;
        }
        this.susness = susness;
        // console.log("update susness to " + susness);
        return susness;
    }

    validateNextState(): "not all cells are in a district" | "bad districts!" | "not enough districts!" | "too sus!" | null {
        // If bad districts exist or some cells not in district, return error
        // Otherwise, determine susness and apply probability;
        // if susness check passes determine votes
        const badDistricts = validateBadDistricts(this);
        if (badDistricts == "not all cells are in a district") {
            return "not all cells are in a district";
        } else if (badDistricts.length != 0) {
            return "bad districts!"
        }

        if (this.numDistricts != this.maxDistricts) {
            return "not enough districts!";
        }

        const susness = this.updateSusness();
        console.log("susness: " + susness);
        if (susness > 3.5) {
            return "too sus!";
        }

        this.totalElectoralVotes = countDistrictVotes(this);

        return null;
    }
}
