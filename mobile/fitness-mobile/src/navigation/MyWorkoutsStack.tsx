import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyWorkoutsScreen from "../screens/MyWorkoutsScreen";
import WorkoutDetailScreen from "../screens/WorkoutDetailScreen";
import StartWorkoutScreen from "../screens/StartWorkoutScreen";
import WorkoutSummaryScreen from "../screens/WorkoutSummaryScreen";
import NewWorkoutScreen from "../screens/NewWorkoutScreen";
import ExerciseListScreen from "../screens/ExerciseListScreen";

export type MyWorkoutsStackParamList = {
  MyWorkoutsList: undefined;
  WorkoutDetail: {
    workoutId: string;
    selectedExercises?: string[]; // ✅ returned from ExerciseList when editing
  };
  StartWorkout: { workoutId: string };
  WorkoutSummary: { sessionId: string };
  NewWorkout: { selectedExercises: string[] | undefined };

  ExerciseList: {
    selected: string[];
    returnTo: "NewWorkout" | "WorkoutDetail"; // ✅ who receives the selection
    returnParams?: { workoutId: string }; // ✅ needed for WorkoutDetail
  };
};

const Stack = createNativeStackNavigator<MyWorkoutsStackParamList>();

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
