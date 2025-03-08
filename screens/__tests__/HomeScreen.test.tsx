import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../HomeScreen';

// Mock the data from clients.json
jest.mock('../../clients.json', () => [
  { id: 'client-001', name: 'Alice Wonderland' },
  { id: 'client-002', name: 'Bob Builder' },
]);

// Mock the entire AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock navigation props
const mockNavigate = jest.fn();
const mockAddListener = jest.fn().mockReturnValue(() => {});
const mockNavigation = {
  navigate: mockNavigate,
  addListener: mockAddListener,
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty list if there are no notes', async () => {
    // Mock AsyncStorage.getItem to return null or empty for @notes
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { getByText, queryByText } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} route={undefined as any} />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText(/No notes found/i)).toBeTruthy();
    });

    // No note item should be visible
    expect(queryByText('Alice Wonderland')).toBeNull();
  });

  it('renders a list of notes if they exist', async () => {
    // Mock AsyncStorage to return some notes
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        {
          id: 'note-001',
          clientId: 'client-001',
          category: 'Goal Evidence',
          text: 'This is a test note',
        },
      ])
    );

    const { getByText, queryByText } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} route={undefined as any} />
      </NavigationContainer>
    );

    // Wait for notes to load
    await waitFor(() => {
      // We expect to see the client name from the note
      expect(getByText(/Alice Wonderland/i)).toBeTruthy();
      expect(getByText(/Goal Evidence/i)).toBeTruthy();
      expect(getByText(/This is a test note/i)).toBeTruthy();
      // "No notes found" should not appear
      expect(queryByText(/No notes found/i)).toBeNull();
    });
  });
});
