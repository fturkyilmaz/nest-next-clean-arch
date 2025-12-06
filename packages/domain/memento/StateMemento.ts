/**
 * Memento Pattern - State Snapshots
 * Allows saving and restoring object state
 */

/**
 * Memento Interface
 */
export interface IMemento<T> {
  getState(): T;
  getTimestamp(): Date;
}

/**
 * Memento Implementation
 */
export class Memento<T> implements IMemento<T> {
  constructor(
    private readonly state: T,
    private readonly timestamp: Date = new Date()
  ) {}

  getState(): T {
    return this.state;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}

/**
 * Originator Interface
 */
export interface IOriginator<T> {
  save(): IMemento<T>;
  restore(memento: IMemento<T>): void;
}

/**
 * Caretaker - Manages mementos
 */
export class Caretaker<T> {
  private mementos: IMemento<T>[] = [];
  private currentIndex: number = -1;

  save(memento: IMemento<T>): void {
    // Remove any mementos after current index (for redo functionality)
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);
    this.mementos.push(memento);
    this.currentIndex++;
  }

  undo(): IMemento<T> | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  redo(): IMemento<T> | null {
    if (this.currentIndex < this.mementos.length - 1) {
      this.currentIndex++;
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.mementos.length - 1;
  }

  getHistory(): IMemento<T>[] {
    return [...this.mementos];
  }

  clear(): void {
    this.mementos = [];
    this.currentIndex = -1;
  }
}

/**
 * Example: Diet Plan Editor with Undo/Redo
 */
export interface DietPlanState {
  name: string;
  description: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export class DietPlanEditor implements IOriginator<DietPlanState> {
  private state: DietPlanState;
  private caretaker: Caretaker<DietPlanState>;

  constructor(initialState: DietPlanState) {
    this.state = { ...initialState };
    this.caretaker = new Caretaker<DietPlanState>();
    // Save initial state
    this.caretaker.save(this.save());
  }

  save(): IMemento<DietPlanState> {
    return new Memento({ ...this.state });
  }

  restore(memento: IMemento<DietPlanState>): void {
    this.state = { ...memento.getState() };
  }

  // Modify state methods
  updateName(name: string): void {
    this.state.name = name;
    this.caretaker.save(this.save());
  }

  updateDescription(description: string): void {
    this.state.description = description;
    this.caretaker.save(this.save());
  }

  updateCalories(calories: number): void {
    this.state.targetCalories = calories;
    this.caretaker.save(this.save());
  }

  updateMacros(protein: number, carbs: number, fat: number): void {
    this.state.targetProtein = protein;
    this.state.targetCarbs = carbs;
    this.state.targetFat = fat;
    this.caretaker.save(this.save());
  }

  // Undo/Redo
  undo(): boolean {
    const memento = this.caretaker.undo();
    if (memento) {
      this.restore(memento);
      return true;
    }
    return false;
  }

  redo(): boolean {
    const memento = this.caretaker.redo();
    if (memento) {
      this.restore(memento);
      return true;
    }
    return false;
  }

  canUndo(): boolean {
    return this.caretaker.canUndo();
  }

  canRedo(): boolean {
    return this.caretaker.canRedo();
  }

  getState(): DietPlanState {
    return { ...this.state };
  }

  getHistory(): Array<{ state: DietPlanState; timestamp: Date }> {
    return this.caretaker.getHistory().map((m) => ({
      state: m.getState(),
      timestamp: m.getTimestamp(),
    }));
  }
}

/**
 * Usage:
 * 
 * const editor = new DietPlanEditor({
 *   name: 'Weight Loss Plan',
 *   description: 'Initial description',
 *   targetCalories: 2000,
 *   targetProtein: 150,
 *   targetCarbs: 200,
 *   targetFat: 65,
 * });
 * 
 * editor.updateName('New Plan Name');
 * editor.updateCalories(1800);
 * 
 * // Undo changes
 * editor.undo(); // Reverts calories
 * editor.undo(); // Reverts name
 * 
 * // Redo changes
 * editor.redo(); // Reapplies name
 * 
 * // Get history
 * const history = editor.getHistory();
 */
