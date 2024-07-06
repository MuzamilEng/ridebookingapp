import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import {
  useGetUserLocationMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../redux/storeApi";

import { useGlobalState } from "../context/GlobalStateProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLocation from "../customHooks/useLocation";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [loginUserApi, { isError, isLoading, isSuccess, data }] =
    useLoginUserMutation();
  const [userData, setUserData] = useState(null);
  const { tokenInlocal } = useGlobalState();
  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    try {
      const res = await loginUserApi({
        email,

        password,
      });
      await tokenInlocal(res);
    } catch (error) {
      Alert.alert("Error", "Failed to login user");
    }
  };
  const [getLocation, {}] = useGetUserLocationMutation();
  const { currentLocation } = useLocation();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          getLocation({
            id: parsedData?.data?.data._id,
            lat: currentLocation?.latitude,
            long: currentLocation?.longitude,
          });
          //   console.log(parsedData, "myDatakkkllll");
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (isSuccess) {
      navigation.navigate("home");

      fetchUserData();
    }
  }, [isSuccess]);
  //   console.log(data, "myData6");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleRegister} disabled={isLoading} />
      {isLoading && <Text>Loading...</Text>}
      {isSuccess && <Text>Login successfully!</Text>}
      {isError && <Text>Failed to Login user</Text>}
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

export default Login;
