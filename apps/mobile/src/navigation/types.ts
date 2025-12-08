import { NavigatorScreenParams } from "@react-navigation/native";

/**
 * Root Stack Navigator Types
 */
export type RootStackParamList = {
    // Main tab navigator
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    // Auth screens
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    // Detail screens
    DietPlanDetails: { planId: string };
    MealDetails: { mealId: string };
    Profile: undefined;
    Settings: undefined;
};

/**
 * Bottom Tab Navigator Types
 */
export type MainTabParamList = {
    Home: undefined;
    DietPlans: undefined;
    Meals: undefined;
    Progress: undefined;
};

// Type helpers for useNavigation and useRoute hooks
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
