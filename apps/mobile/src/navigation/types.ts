import { NavigatorScreenParams } from "@react-navigation/native";

/**
 * Root Stack Navigator Types
 */
export type RootStackParamList = {
    // Main tab navigator
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    // Auth stack navigator
    Auth: NavigatorScreenParams<AuthStackParamList>;
    // Detail screens
    DietPlanDetail: { planId: string };
    CreateDietPlan: undefined;
    MealDetails: { mealId: string };
    Profile: undefined;
    Settings: undefined;
    Users: undefined;
    ClientDetail: { clientId: string };
    AddClient: undefined;
};

/**
 * Auth Stack Navigator Types
 */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

/**
 * Bottom Tab Navigator Types
 */
export type MainTabParamList = {
    Home: undefined;
    Clients: undefined;
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
