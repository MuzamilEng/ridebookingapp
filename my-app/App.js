import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Alert } from "react-native";
import PaymentScreen from "./screens/Payment";
import Map from "./screens/Map"; // Make sure the path is correct
import Register from "./screens/Register";

import { Provider } from "react-redux";
import { store } from "./redux/store";

import { GlobalContextProvider } from "./context/GlobalStateProvider";

import Login from "./screens/Login";
import HomeScreen from "./screens/HomeScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <GlobalContextProvider>
        <StripeProvider publishableKey="pk_test_51PQFreRvJI1ePtmLcNj1cfOWDLO7hiiJ7We2fNJxyAOOrqDse9wNZSvxSII3f6PyDBIz4LakPITeYQGaRfrM4rb900i2aZENEZ">
          <NavigationContainer>
            <Stack.Navigator initialRouteName="home">
              <Stack.Screen name="payment" component={PaymentScreen} />
              <Stack.Screen name="home" component={HomeScreen} />
              <Stack.Screen name="Map" component={Map} />
              <Stack.Screen name="register" component={Register} />
              <Stack.Screen name="login" component={Login} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </StripeProvider>
      </GlobalContextProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
