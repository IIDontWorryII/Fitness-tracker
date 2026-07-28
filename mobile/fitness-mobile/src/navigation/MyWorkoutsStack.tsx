/*
  ============================================================
  Datei: MyWorkoutsStack.tsx (Mobile App)

  Rolle im Projekt:
  Diese Datei definiert die Stack-Navigation fuer den
  MyWorkouts Bereich der Mobile App.

  Zweck:
  - Navigation zwischen Workout-bezogenen Screens
  - Strukturierung eines zusammenhaengenden User-Flows
  - Typisierte Navigation mit Parametern

  Enthaltene Screens:
  - Workout Liste
  - Workout Detail
  - Workout Start
  - Workout Summary
  - New Workout
  - Exercise List (Auswahl von Uebungen)

  Architekturentscheidung:
  - Native Stack Navigator fuer hierarchische Navigation
  - Starke Typisierung der Routenparameter
  ============================================================
*/
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyWorkoutsScreen from "../screens/MyWorkoutsScreen";
import WorkoutDetailScreen from "../screens/WorkoutDetailScreen";
import StartWorkoutScreen from "../screens/StartWorkoutScreen";
import WorkoutSummaryScreen from "../screens/WorkoutSummaryScreen";
import NewWorkoutScreen from "../screens/NewWorkoutScreen";
import ExerciseListScreen from "../screens/ExerciseListScreen";

/*
  ============================================================
  Typdefinition fuer Stack Navigation Parameter
  ============================================================

  Dieser Typ beschreibt:
  - welche Screens existieren
  - welche Parameter sie erwarten
  - welche optional sind

  Vorteil:
  - TypeScript erkennt falsche Navigation sofort
  - Keine Runtime-Fehler durch falsche Params
*/
export type MyWorkoutsStackParamList = {
  MyWorkoutsList: undefined;
  WorkoutDetail: {
    workoutId: string;
    selectedExercises?: string[];
  };
  StartWorkout: { workoutId: string };
  WorkoutSummary: { sessionId: string };
  NewWorkout: { selectedExercises: string[] | undefined };

  /*
    Exercise List Screen:
    Wird wiederverwendet fuer:
    - NewWorkout
    - WorkoutDetail

    returnTo definiert,
    welcher Screen die Auswahl erhaelt.
  */
  ExerciseList: {
    selected: string[];
    returnTo: "NewWorkout" | "WorkoutDetail";
    returnParams?: { workoutId: string };
  };
};

/*
  Erstellung des Native Stack Navigators
  mit Typsicherheit.
*/
const Stack = createNativeStackNavigator<MyWorkoutsStackParamList>();

/*
  ============================================================
  MyWorkoutsStack Komponente
  ============================================================

  Definiert die Reihenfolge und Konfiguration
  der Screens im MyWorkouts Bereich.
*/
export default function MyWorkoutsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyWorkoutsList"
        component={MyWorkoutsScreen}
        options={{ title: "My Workouts" }}
      />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: "Workout" }}
      />
      <Stack.Screen
        name="StartWorkout"
        component={StartWorkoutScreen}
        options={{ title: "Start Workout" }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{ title: "Workout Summary" }}
      />
      <Stack.Screen
        name="NewWorkout"
        component={NewWorkoutScreen}
        options={{ title: "New Workout" }}
      />
      <Stack.Screen
        name="ExerciseList"
        component={ExerciseListScreen}
        options={{ title: "Exercise List" }}
      />
    </Stack.Navigator>
  );
}
