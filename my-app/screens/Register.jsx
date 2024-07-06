import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRegisterUserMutation } from "../redux/storeApi";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [password, setPassword] = useState("");
  const [registerUser, { isError, isLoading, isSuccess }] =
    useRegisterUserMutation();
  const navigation = useNavigation();
  const handleRegister = async () => {
    if (!name || !email || !userType || !password) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    try {
      registerUser({
        name,
        email,
        userType: userType.toLocaleLowerCase(),
        password,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to register user");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigation.navigate("login");
    }
  }, [isSuccess]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register User</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="User Type"
        value={userType}
        onChangeText={setUserType}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} disabled={isLoading} />
      {isLoading && <Text>Loading...</Text>}
      {isSuccess && <Text>User registered successfully!</Text>}
      {isError && <Text>Failed to register user</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default Register;
