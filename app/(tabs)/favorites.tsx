import { View, Text, Image, FlatList, Pressable, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import className from "twrnc";

// Custom Remove Icon
const RemoveIcon = () => (
  <Text style={className`text-red-500 text-xl`}>❌</Text>
);

// Custom Play Icon
const PlayIcon = () => (
  <Text style={className`text-green-500 text-2xl p-10`}>▶</Text>
);

// Custom Stop Icon
const StopIcon = () => (
  <Text style={className`text-blue-500 text-2xl p-10`}>⏯</Text>
);

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [sound, setSound] = useState(null);

  // Load favorites from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    loadFavorites();

    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Remove a song from favorites
  const removeFromFavorites = async (url) => {
    const updatedFavorites = favorites.filter((song) => song.url !== url);
    setFavorites(updatedFavorites);

    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Alert.alert("Removed from Favorites");
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // Play a song
  const playSong = async (url) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true }
    );

    setSound(newSound);
    setCurrentSong(url);
  };

  // Stop playing the song
  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setCurrentSong(null);
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <View
      style={className`flex-row items-center justify-between p-4 bg-gray-800 rounded-lg mb-4`}
    >
      <Image
        source={{ uri: item.artwork }}
        style={className`h-20 w-20 rounded-lg`}
      />
      <View style={className`flex-1 ml-4`}>
        <Text style={className`text-white text-lg font-bold`}>
          {item.title}
        </Text>
        <Text style={className`text-gray-400 text-sm`}>
          {item.artist || "Unknown Artist"}
        </Text>
      </View>
      <View style={className`flex-row items-center`}>
        {currentSong === item.url ? (
          <Pressable onPress={stopSong}>
            <StopIcon />
          </Pressable>
        ) : (
          <Pressable onPress={() => playSong(item.url)}>
            <PlayIcon />
          </Pressable>
        )}
        <Pressable onPress={() => removeFromFavorites(item.url)}>
          <RemoveIcon />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={className`flex-1 bg-gray-900 p-4`}>
      <Text style={className`text-white text-2xl font-bold mb-4`}>
        Favorites
      </Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.url}
          renderItem={renderFavoriteItem}
        />
      ) : (
        <Text style={className`text-gray-400 text-center`}>
          No favorite songs yet!
        </Text>
      )}
    </View>
  );
};

export default Favorites;
