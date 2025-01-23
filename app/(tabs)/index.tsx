import { View, Text, TextInput, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import className from "twrnc"; // For using TailwindCSS
import AsyncStorage from "@react-native-async-storage/async-storage";
import Tracks from "@/components/Tracks";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [passwordStrength, setPasswordStrength] = useState(""); // Track password strength

  // Validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      return "Weak";
    } else if (password.length < 10) {
      return "Medium";
    } else {
      return "Strong";
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (password.length === 0) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const { storedEmail, storedPassword } = JSON.parse(userData);
        if (email === storedEmail && password === storedPassword) {
          setIsLoggedIn(true); // Log the user in
          Alert.alert("Success", "Logged in successfully!");
        } else {
          Alert.alert("Error", "Invalid email or password.");
        }
      } else {
        Alert.alert("Error", "No user found. Please sign up.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      Alert.alert("Error", "An error occurred while logging in.");
    }
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (password.length === 0) {
      Alert.alert("Error", "Please enter a password.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const strength = checkPasswordStrength(password);
    if (strength === "Weak") {
      Alert.alert("Weak Password", "Please choose a stronger password.");
      return;
    }

    try {
      const userData = { storedEmail: email, storedPassword: password };
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      Alert.alert("Success", "Account created successfully!");

      // Automatically log the user in after sign-up
      setIsLoggedIn(true); // Redirect to the Tracks component
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "An error occurred while signing up.");
    }
  };

  // Render Login or Sign Up form
  const renderAuthForm = () => (
    <View style={className`flex-1 justify-center p-4 bg-gray-900`}>
      <Text style={className`text-2xl font-bold text-white mb-4 text-center`}>
        {isLogin ? "Login" : "Sign Up"}
      </Text>

      {/* Email Input */}
      <TextInput
        style={className`bg-gray-800 text-white p-3 rounded-lg mb-4`}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={className`bg-gray-800 text-white p-3 rounded-lg mb-2`}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordStrength(checkPasswordStrength(text));
        }}
        secureTextEntry
      />
      {password.length > 0 && (
        <Text
          style={className`text-sm ${
            passwordStrength === "Weak"
              ? "text-red-500"
              : passwordStrength === "Medium"
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          Password Strength: {passwordStrength}
        </Text>
      )}

      {/* Confirm Password Input (for Sign Up) */}
      {!isLogin && (
        <TextInput
          style={className`bg-gray-800 text-white p-3 rounded-lg mt-4`}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}

      {/* Login/Sign Up Button */}
      <Pressable
        style={className`bg-blue-500 p-3 rounded-lg mt-6`}
        onPress={isLogin ? handleLogin : handleSignUp}
      >
        <Text style={className`text-white text-center`}>
          {isLogin ? "Login" : "Sign Up"}
        </Text>
      </Pressable>

      {/* Toggle between Login and Sign Up */}
      <Pressable style={className`mt-4`} onPress={() => setIsLogin(!isLogin)}>
        <Text style={className`text-gray-400 text-center`}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={className`flex-1`}>
      {isLoggedIn ? <Tracks /> : renderAuthForm()}
    </View>
  );
};

export default Index;
