import AsyncStorage from "@react-native-async-storage/async-storage";

export async function resetAuthValues() {
    await AsyncStorage.multiRemove(['isAuth', 'email', 'name', 'token']);
}
