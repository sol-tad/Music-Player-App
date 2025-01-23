import { View, Text, Image, Pressable, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import className from "twrnc";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import data from "../assets/data/library.json";
import RedHeart from "@/assets/icons/RedHeart";
import EmptyHeart from "@/assets/icons/EmptyHeart";
import Backward from "@/assets/icons/Backward";
import Play from "@/assets/icons/Play";
import Forward from "@/assets/icons/Forward";
import Stop from "@/assets/icons/Stop";

const MusicScreen = ({ onpress, song }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(song); // Track the current song
  const [currentIndex, setCurrentIndex] = useState(
    data.findIndex((track) => track.url === song.url)
  ); // Track the current song index

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        } else {
          await AsyncStorage.setItem("favorites", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    loadFavorites();
  }, []);

  // Play or stop the current track
  const togglePlayStop = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: currentTrack.url,
      });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    }
  };

  // Stop and unload the current sound
  const stopMusic = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  // Handle next track
  const handleNext = async () => {
    await stopMusic(); // Stop the current song
    const nextIndex = (currentIndex + 1) % data.length; // Calculate the next index
    setCurrentIndex(nextIndex); // Update the current index
    setCurrentTrack(data[nextIndex]); // Update the current track
  };

  // Handle previous track
  const handlePrevious = async () => {
    await stopMusic(); // Stop the current song
    const previousIndex = (currentIndex - 1 + data.length) % data.length; // Calculate the previous index
    setCurrentIndex(previousIndex); // Update the current index
    setCurrentTrack(data[previousIndex]); // Update the current track
  };

  // Toggle favorite functionality
  const toggleFavorite = async () => {
    const isFavorite = favorites.some(
      (track) => track.url === currentTrack.url
    );

    let updatedFavorites;
    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = favorites.filter(
        (track) => track.url !== currentTrack.url
      );
      Alert.alert("Removed from Favorites");
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, { ...currentTrack }];
      Alert.alert("Added to Favorites");
    }

    setFavorites(updatedFavorites);

    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup sound on component unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View
      style={className`absolute bg-[rgba(55,155,55,0.98)] top-0 left-0 right-0 bottom-0 rounded-xl p-5 flex-col justify-center items-center gap-2`}
    >
      <View style={className`p-1 w-15 rounded-full bg-gray-500`} />
      <Pressable onPress={onpress}>
        <Image
          source={{ uri: currentTrack.artwork }}
          style={className`h-85 w-85 rounded-xl`}
        />
      </Pressable>
      <View style={className`flex-row justify-between items-center w-80`}>
        <View>
          <Text style={className`text-lg text-white font-bold`}>
            {currentTrack.title}
          </Text>
          <Text style={className`text-lg text-white`}>
            {currentTrack.artist || "Unknown Artist"}
          </Text>
        </View>
        <Pressable onPress={toggleFavorite}>
          {favorites.some((track) => track.url === currentTrack.url) ? (
            <RedHeart />
          ) : (
            <EmptyHeart />
          )}
        </Pressable>
      </View>
      <View style={className`p-5 flex-row justify-center items-center gap-5`}>
        <Pressable onPress={handlePrevious}>
          <Backward />
        </Pressable>
        <Pressable onPress={togglePlayStop}>
          {isPlaying ? <Stop /> : <Play />}
        </Pressable>
        <Pressable onPress={handleNext}>
          <Forward />
        </Pressable>
      </View>
    </View>
  );
};

export default MusicScreen;
