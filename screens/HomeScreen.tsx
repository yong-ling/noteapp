import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';

interface Note {
  id: string;
  clientId: string;
  category: string;
  text: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });
    loadNotes();
    loadClients();
    return unsubscribe;
  }, [navigation]);

  // Load notes from AsyncStorage
  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('@notes');
      if (data) {
        setNotes(JSON.parse(data));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  };

  // Build a map from clientId -> clientName, using clients.json
  const loadClients = async () => {
    try {
      const clientsData = require('../clients.json');
      const map: Record<string, string> = {};
      clientsData.forEach((client: { id: string; name: string }) => {
        map[client.id] = client.name;
      });
      setClientMap(map);
    } catch (error) {
      console.log('Error loading clients:', error);
    }
  };

  const handleAddNote = () => {
    navigation.navigate('NoteForm');
  };

  const handleEditNote = (noteId: string) => {
    navigation.navigate('NoteForm', { noteId });
  };

  // Remove a note from the array and save to AsyncStorage
  const handleDeleteNote = async (noteId: string) => {
    try {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this note?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updated = notes.filter((n) => n.id !== noteId);
              setNotes(updated);
              await AsyncStorage.setItem('@notes', JSON.stringify(updated));
            }
          }
        ]
      );
    } catch (error) {
      console.log('Error deleting note:', error);
    }
  };

  const renderItem = ({ item }: { item: Note }) => {
    const clientName = clientMap[item.clientId] || 'Unknown Client';

    return (
      <View style={styles.noteContainer}>
        <TouchableOpacity
          style={styles.noteInfo}
          onPress={() => handleEditNote(item.id)}
        >
          <Text style={styles.noteClient}>{clientName}</Text>
          <Text style={styles.noteCategory}>{item.category}</Text>
          <Text numberOfLines={2}>{item.text}</Text>
        </TouchableOpacity>
        <View style={styles.deleteButton}>
          <Button
            title="Delete"
            color="red"
            onPress={() => handleDeleteNote(item.id)}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No notes found. Tap "Add Note" to create one.
          </Text>
        }
      />

      <View style={styles.addButton}>
        <Button title="Add Note" onPress={handleAddNote} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#eef',
    marginBottom: 8,
    borderRadius: 6,
  },
  noteInfo: {
    flex: 1,
    padding: 10,
  },
  noteClient: {
    fontWeight: '600',
    marginBottom: 2,
  },
  noteCategory: {
    fontStyle: 'italic',
    marginBottom: 4,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingRight: 10,
  },
  addButton: {
    marginTop: 16,
  },
});
