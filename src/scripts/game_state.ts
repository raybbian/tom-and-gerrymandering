import { Face, GridGenerator } from "./grid";
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
    public cells: Cell[];
    // public currentCellSelection: number | null;
    // public mouseDown: boolean;
    // public currentDistrictSelection: number | null;
    public numDistricts: number;
    // (district number, Set<cells in the district>)
    public districts: Map<number, Set<number>>;

    static perlinPopulation = new PerlinNoise(1);
    static perlinVoterDistribution = new PerlinNoise(1);

    constructor(grid: GridGenerator) {
        this.cells = Array.from(grid.dcel.faces).map(
            (face) => {
                const center = face.centerPoint();

                let voterPopulation: 1 | 2 | 3 = 1;
                const noise = GameState.perlinPopulation.getNormalizedNoise(...center, 0, 1);
                if (noise > 0.73) {
                    voterPopulation = 3;
                }
                else if (noise > 0.5) {
                    voterPopulation = 2;
                }
                else {
                    voterPopulation = 1;
                }

                const voterProportion = GameState.perlinVoterDistribution.getNormalizedNoise(...center, .20, .80);
                return new Cell(voterPopulation, noise, voterProportion, face);
            }
        );

        // this.currentCellSelection = null;
        // this.mouseDown = false;
        // this.currentDistrictSelection = 0;
        this.numDistricts = 0;
        this.districts = new Map();
        for (let i = 1; i <= 15; i++) {
            this.districts.set(i, new Set());
        }
    }

    addCellToDistrict(cellIndex: number, district: number | null) {
        const previousDistrict = this.cells[cellIndex].district;
        console.log(district == null);
        if (previousDistrict != null) {
            // const newDistrictSize = this.district_sizes.get(previousDistrict)! - this.cells[cellIndex].population;
            this.districts.get(previousDistrict)!.delete(cellIndex);
            if (this.districts.get(previousDistrict)!.size == 0) {
                this.numDistricts--;
            }
        }
        this.cells[cellIndex].district = district;
        if (district != null) {
            if (district > this.numDistricts) {
                this.numDistricts = district;
            }
            console.log("attempting to get district " + district);
            this.districts.get(district)!.add(cellIndex);
            console.log(
                "district size is: " + this.districts.get(district)!.size,
            );
            // this.district_sizes.set(district, this.district_sizes.get(district)! + this.cells[cellIndex].population);
            // this.districts.get(district)!.(cellIndex);
        }
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
}
