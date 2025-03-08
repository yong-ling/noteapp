// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import NoteFormScreen from './screens/NoteFormScreen';

export type RootStackParamList = {
  Home: undefined;
  NoteForm: {
    noteId?: string;  // If editing existing
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'My Notes' }}
        />
        <Stack.Screen
          name="NoteForm"
          component={NoteFormScreen}
          options={{ title: 'Note Form' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
