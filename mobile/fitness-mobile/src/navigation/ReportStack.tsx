import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkoutHistoryScreen from "../screens/WorkoutHistoryScreen";
import WorkoutSummaryScreen from "../screens/WorkoutSummaryScreen";

export type ReportStackParamList = {
  WorkoutHistory: undefined;
  WorkoutSummary: { sessionId: string };
};

const Stack = createNativeStackNavigator<ReportStackParamList>();

export default function ReportStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="WorkoutHistory"
        component={WorkoutHistoryScreen}
        options={{ title: "Workout History" }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{ title: "Workout Summary" }}
      />
    </Stack.Navigator>
  );
}
