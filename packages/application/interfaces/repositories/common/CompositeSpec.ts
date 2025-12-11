import { Specification } from './Specification';

export class CompositeSpec<T> extends Specification<T> {
    constructor(
        private readonly left: Specification<T>,
        private readonly right: Specification<T>,
        private readonly operator: 'AND' | 'OR'
    ) {
        super();
    }

    isSatisfiedBy(candidate: T): boolean {
        return this.operator === 'AND'
            ? this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
            : this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
    }

    toPrismaWhere() {
        const leftWhere = this.left.toPrismaWhere?.() || {};
        const rightWhere = this.right.toPrismaWhere?.() || {};
        return this.operator === 'AND'
            ? { AND: [leftWhere, rightWhere] }
            : { OR: [leftWhere, rightWhere] };
    }

    /**
     * Combine with another specification using AND
     */
    and(other: Specification<T>): CompositeSpec<T> {
        return new CompositeSpec<T>(this, other, 'AND');
    }

    /**
     * Combine with another specification using OR
     */
    or(other: Specification<T>): CompositeSpec<T> {
        return new CompositeSpec<T>(this, other, 'OR');
    }
}
