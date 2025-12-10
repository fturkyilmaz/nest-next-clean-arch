import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RootStackParamList, MainTabParamList } from "./types";
import {
    HomeIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CalculatorIcon,
    ChartBarIcon,
} from 'react-native-heroicons/outline';

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
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#818cf8", // Indigo 400
                tabBarInactiveTintColor: "#a1a1aa", // Zinc 400
                tabBarStyle: {
                    backgroundColor: "#1f2937", // Gray 800
                    borderTopWidth: 0,
                    paddingBottom: 4,
                    paddingTop: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                },
                tabBarIcon: ({ color, size }) => {
                    let IconComponent;

                    if (route.name === 'Home') {
                        IconComponent = HomeIcon;
                    } else if (route.name === 'Clients') {
                        IconComponent = UserGroupIcon;
                    } else if (route.name === 'DietPlans') {
                        IconComponent = ClipboardDocumentListIcon;
                    } else if (route.name === 'Meals') {
                        IconComponent = CalculatorIcon;
                    } else if (route.name === 'Progress') {
                        IconComponent = ChartBarIcon;
                    }
                    // You can return any component that you like here!
                    return IconComponent ? <IconComponent name={route.name} size={size} color={color} /> : null;
                },
            })}
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
