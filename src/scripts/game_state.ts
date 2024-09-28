class Cell {
    public population: 1 | 2 | 3;
    public voterProportion: number;
    public district: number | null;
    constructor(population: 1 | 2 | 3, voterProportion: number) {
        // an int: [1, 2, 3]
        this.population = population;
        // a float in the range [0, 1]
        this.voterProportion = voterProportion;
        // 0 if the cell is not part of a district, otherwise the district number it is part of
        this.district = null;
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
    constructor() {
        // TODO: add noise generation logic
        this.cells = [];
        for (let i = 0; i < 500; i++) {
            this.cells.push(new Cell(1, 1))
        }
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
            console.log("district size is: " + this.districts.get(district)!.size)
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
