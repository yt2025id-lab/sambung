import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="sambung"
        options={{
          title: "Sambung",
          tabBarLabel: "Kirim",
        }}
      />
    </Tabs>
  );
}
