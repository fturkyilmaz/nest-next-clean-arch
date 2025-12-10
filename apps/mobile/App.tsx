import "./global.css"
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "./src/navigation";

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            retry: 1,
        },
    },
});

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <SafeAreaView style={{ flex: 1 }}>
                    <SafeAreaProvider >
                        <StatusBar style="auto" />
                        <RootNavigator />
                    </SafeAreaProvider>
                </SafeAreaView>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
