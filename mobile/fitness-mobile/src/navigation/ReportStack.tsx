/*
  ============================================================
  Datei: ReportStack.tsx (Mobile App)

  Rolle im Projekt:
  Diese Datei definiert die Stack-Navigation fuer den
  Report-Bereich der Mobile App.

  Zweck:
  - Navigation zwischen Auswertungs-Screens
  - Anzeige von Trainingshistorie
  - Detailansicht einzelner Workout Sessions

  Enthaltene Screens:
  - WorkoutHistory (Liste aller Sessions)
  - WorkoutSummary (Detailansicht einer Session)

  Architekturentscheidung:
  - Eigener Stack innerhalb des Report Tabs
  - Klare Trennung von Workouts und Reports
  ============================================================
*/
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
