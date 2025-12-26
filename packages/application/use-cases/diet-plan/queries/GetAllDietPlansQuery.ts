export class GetAllDietPlansQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly status?: string,
    public readonly isActive?: boolean
  ) {}

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}
