import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_KEY_TODO = "@toDos";
const STORAGE_KEY_MODE = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY_TODO, JSON.stringify(toSave));
  };
  const saveMode = async (mode) => {
    await AsyncStorage.setItem(STORAGE_KEY_MODE, JSON.stringify(mode));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY_TODO);
    setToDos(JSON.parse(s));
  };
  const loadMode = async () => {
    const mode = await AsyncStorage.getItem(STORAGE_KEY_MODE);
    setWorking(JSON.parse(mode));
  };
  const addToDo = async () => {
    if (!text) return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const updateToDoStatus = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key] = { ...newToDos[key], done: !newToDos[key].done };
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const updateToDoText = async (key) => {
    Alert.prompt("투두이름수정", "〰️", async (text) => {
      if (!text) return;
      const newToDos = { ...toDos };
      newToDos[key] = { ...newToDos[key], text };
      setToDos(newToDos);
      await saveToDos(newToDos);
    });
  };

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);

  useEffect(() => {
    saveMode(working);
  }, [working]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity>
          <Text
            style={{ ...styles.button, color: working ? "white" : theme.grey }}
            onPress={work}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={{ ...styles.button, color: !working ? "white" : theme.grey }}
            onPress={travel}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />
        <ScrollView>
          {toDos &&
            Object.keys(toDos).map(
              (key) =>
                toDos[key].working === working && (
                  <View style={styles.toDo} key={key}>
                    <Text
                      style={
                        !toDos[key].done ? styles.toDoText : styles.doneText
                      }
                      onPress={() => updateToDoStatus(key)}
                    >
                      {toDos[key].text}
                    </Text>
                    <View style={styles.iconButtons}>
                      <TouchableOpacity
                        style={{ color: "white", marginRight: 15 }}
                        onPress={() => updateToDoText(key)}
                      >
                        <FontAwesome5 name="pen" size={16} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteToDo(key)}>
                        <MaterialIcons name="delete" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
            )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  button: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  doneText: {
    color: theme.grey,
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  iconButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
});
