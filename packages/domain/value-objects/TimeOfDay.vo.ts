// packages/domain/value-objects/TimeOfDay.vo.ts
import { TimeOfDay as TimeOfDayEnum } from "@shared/types";


export class TimeOfDay {
    private constructor(public readonly value: TimeOfDayEnum) { }

    static fromString(val: string): TimeOfDay {
        if (!Object.values(TimeOfDayEnum).includes(val as TimeOfDayEnum)) {
            throw new Error(`Invalid TimeOfDay: ${val}`);
        }
        return new TimeOfDay(val as TimeOfDayEnum);
    }

    equals(other: TimeOfDay): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
