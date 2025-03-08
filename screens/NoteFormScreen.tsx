import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';

// The categories we can choose
const CATEGORIES = ['Goal Evidence', 'Support Coordination', 'Active Duty'];

interface Note {
  id: string;
  clientId: string;
  category: string;
  text: string;
}

interface Client {
  id: string;
  name: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'NoteForm'>;

export default function NoteFormScreen({ route, navigation }: Props) {
  const { noteId } = route.params || {}; // undefined if new note
  const editMode = !!noteId; // true if editing existing note

  const [notes, setNotes] = useState<Note[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0]
  );
  const [text, setText] = useState('');

  useEffect(() => {
    loadNotes();
    loadClients();
  }, []);

  useEffect(() => {
    // If we already have notes loaded, find the note if editing
    if (editMode && notes.length > 0) {
      const existing = notes.find((note) => note.id === noteId);
      if (existing) {
        setSelectedClientId(existing.clientId);
        setSelectedCategory(existing.category);
        setText(existing.text);
      }
    }
  }, [editMode, noteId, notes]);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('@notes');
      if (data) {
        setNotes(JSON.parse(data));
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  };

  const loadClients = () => {
    try {
      const clientsData = require('../clients.json') as Client[];
      setClients(clientsData);
    } catch (error) {
      console.log('Error loading clients:', error);
    }
  };

  const saveNotes = async (updated: Note[]) => {
    try {
      await AsyncStorage.setItem('@notes', JSON.stringify(updated));
      setNotes(updated);
    } catch (error) {
      console.log('Error saving notes:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      Alert.alert('Validation', 'Please select a client.');
      return;
    }
    if (!text.trim()) {
      Alert.alert('Validation', 'Please enter some note text.');
      return;
    }

    let updatedNotes: Note[];

    if (editMode && noteId) {
      // update existing
      updatedNotes = notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              clientId: selectedClientId,
              category: selectedCategory,
              text,
            }
          : n
      );
    } else {
      // create new
      const newNote: Note = {
        id: uuidv4(),
        clientId: selectedClientId,
        category: selectedCategory,
        text,
      };
      updatedNotes = [...notes, newNote];
    }

    await saveNotes(updatedNotes);
    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!editMode || !noteId) return;

    const updated = notes.filter((n) => n.id !== noteId);
    await saveNotes(updated);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {editMode ? 'Edit Note' : 'Add New Note'}
      </Text>

      <Text style={styles.label}>Select Client:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedClientId}
          onValueChange={(val) => setSelectedClientId(val.toString())}
        >
          <Picker.Item label="-- Choose Client --" value="" />
          {clients.map((client) => (
            <Picker.Item
              key={client.id}
              label={client.name}
              value={client.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Category:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(val) => setSelectedCategory(val.toString())}
        >
          {CATEGORIES.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Note Text:</Text>
      <TextInput
        style={styles.textInput}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Enter your note details here..."
      />

      <Button
        title={editMode ? 'Save Changes' : 'Add Note'}
        onPress={handleSave}
      />

      {editMode && (
        <View style={{ marginTop: 10 }}>
          <Button title="Delete Note" onPress={handleDelete} color="red" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    minHeight: 80,
    padding: 8,
    marginTop: 6,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
});
