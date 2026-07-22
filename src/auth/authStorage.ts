import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_LOGGED_IN_KEY = 'isLoggedIn';

export async function getIsLoggedIn(): Promise<boolean> {
  const value = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);
  return value === 'true';
}

export async function setLoggedIn(loggedIn: boolean): Promise<void> {
  await AsyncStorage.setItem(IS_LOGGED_IN_KEY, loggedIn ? 'true' : 'false');
}
