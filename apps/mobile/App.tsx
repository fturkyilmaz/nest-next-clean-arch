// apps/mobile/App.tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { View, Text, FlatList } from 'react-native';

const qc = new QueryClient();

function DietPlan() {
  const { data, isLoading } = useQuery({
    queryKey: ['dietplan'],
    queryFn: async () => (await axios.get('http://localhost:3001/api/v1/dietplans/current')).data,
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>My Diet Plan</Text>
      <FlatList
        data={data?.meals ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Text>{item.name} - {item.calories} kcal</Text>}
      />
    </View>
  );
}
cat > apps/mobile/App.tsx << 'EOF'
// apps/mobile/App.tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { View, Text, FlatList } from 'react-native';

const qc = new QueryClient();

function DietPlan() {
  const { data, isLoading } = useQuery({
    queryKey: ['dietplan'],
    queryFn: async () => (await axios.get('http://localhost:3001/api/v1/dietplans/current')).data,
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>My Diet Plan</Text>
      <FlatList
        data={data?.meals ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Text>{item.name} - {item.calories} kcal</Text>}
      />
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <DietPlan />
    </QueryClientProvider>
  );
}
