export default class RNG {

    constructor(seed) {
        this.seed = seed;
    }

    next() {

        this.seed =
            (this.seed * 16807)
            % 2147483647;

        return this.seed
            / 2147483647;
    }
}