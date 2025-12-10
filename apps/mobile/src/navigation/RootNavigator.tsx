import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList, MainTabParamList } from "./types";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ClientsScreen from "../screens/ClientsScreen";
import DietPlansScreen from "../screens/DietPlansScreen";
import MealsScreen from "../screens/MealsScreen";
import ProgressScreen from "../screens/ProgressScreen";
import UsersScreen from "../screens/UsersScreen";
import DietPlanDetailScreen from "../screens/DietPlanDetailScreen";
import CreateDietPlanScreen from "../screens/CreateDietPlanScreen";
import ClientDetailScreen from "../screens/ClientDetailScreen";
import AddClientScreen from "../screens/AddClientScreen";

const Stack = createNativeStackNavigator<RootStackParamList>() as any;
const Tab = createBottomTabNavigator<MainTabParamList>() as any;

/**
 * Bottom Tab Navigator for main app screens
 */
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2563eb",
                tabBarInactiveTintColor: "#6b7280",
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopColor: "#e5e7eb",
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 64,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: "Home" }}
            />
            <Tab.Screen
                name="Clients"
                component={ClientsScreen}
                options={{ tabBarLabel: "Clients" }}
            />
            <Tab.Screen
                name="DietPlans"
                component={DietPlansScreen}
                options={{ tabBarLabel: "Diet Plans" }}
            />
            <Tab.Screen
                name="Meals"
                component={MealsScreen}
                options={{ tabBarLabel: "Meals" }}
            />
            <Tab.Screen
                name="Progress"
                component={ProgressScreen}
                options={{ tabBarLabel: "Progress" }}
            />
        </Tab.Navigator>
    );
}

/**
 * Root Stack Navigator
 */
export default function RootNavigator() {
    return (
        // @ts-ignore
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            >
                <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                <Stack.Screen name="Users" component={UsersScreen} />
                <Stack.Screen name="DietPlanDetail" component={DietPlanDetailScreen} />
                <Stack.Screen name="CreateDietPlan" component={CreateDietPlanScreen} />
                <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
                <Stack.Screen name="AddClient" component={AddClientScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
