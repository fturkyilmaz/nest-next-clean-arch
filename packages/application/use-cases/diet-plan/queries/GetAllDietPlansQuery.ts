export class GetAllDietPlansQuery {
    constructor(
        public readonly status?: string,
        public readonly isActive?: boolean,
        public readonly skip?: number,
        public readonly take?: number
    ) { }
}
