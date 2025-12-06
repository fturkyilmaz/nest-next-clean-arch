export interface DietPlanDTO {
    id?: string;
    clientId: string;
    dietitianId: string;
    meals: { name: string; calories: number; timeOfDay: string }[];
}
