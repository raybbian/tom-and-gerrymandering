export class PerlinNoise {
    private n: number;
    private p: number[];
    private permutation: number[];
    private rng: () => number;

    constructor(n: number, seed = 0xdecaf) {
        this.rng = this.createSeededRandom(seed);
        this.n = n;
        // Initialize the permutation array
        this.permutation = Array.from(Array(256).keys()).map((_, i) => i);
        this.shuffle(this.permutation);
        this.p = [...this.permutation, ...this.permutation]; // Duplicate the array
    }

    private createSeededRandom(seed: number) {
        const m = 0x80000000; // 2^31
        const a = 1103515245;
        const c = 12345;

        let currentSeed = seed ? seed : Math.floor(Math.random() * m);

        return function() {
            currentSeed = (a * currentSeed + c) % m;
            return currentSeed / m;
        };

    }

    private shuffle(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(this.rng() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number): number {
        const h = hash & 3; // Convert low 2 bits of hash code
        const u = h < 2 ? x : y; // Gradient value 1-2
        const v = h < 2 ? y : x; // Gradient value 1-2
        return (h & 1 ? -u : u) + (h & 2 ? -v : v); // Randomly invert gradients
    }

    public noise(x: number, y: number): number {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);

        const aa = this.p[this.p[xi] + yi];
        const ab = this.p[this.p[xi] + yi + 1];
        const ba = this.p[this.p[xi + 1] + yi];
        const bb = this.p[this.p[xi + 1] + yi + 1];

        const x1 = this.lerp(this.grad(aa, x, y), this.grad(ba, x - 1, y), u);
        const x2 = this.lerp(this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1), u);

        return this.lerp(x1, x2, v);
    }

    public getNormalizedNoise(x: number, y: number, range_0: number, range_1: number): number {
        let noiseValue = this.noise(x / this.n, y / this.n);
        noiseValue = (noiseValue + 1) / 2.0;
        noiseValue *= range_1 - range_0;
        noiseValue += range_0;
        return noiseValue;
    }
}
