import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Audio } from "expo-av";
import className from "twrnc";
import data from "../../assets/data/library.json";

const Artists = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.artist?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  // Play music
  const playMusic = async (url: string) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Load and play the new sound
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Stop music
  const stopMusic = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  };

  return (
    <View style={className`flex-1 gap-3 p-4 bg-gray-900`}>
      {/* Search Input */}
      <View
        style={className`flex-row items-center bg-gray-800 p-3 rounded-lg mb-4`}
      >
        <TextInput
          style={className`flex-1 text-white`}
          placeholder="Search Artist"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Artist List */}
      <ScrollView>
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item.artist || "unknown"}-${index}`}
          renderItem={({ item }) => (
            <View
              style={className`flex-row gap-3 py-2 mb-2 justify-start items-center w-full`}
            >
              {/* Artwork */}
              <Image
                source={{ uri: item.artwork }}
                style={className`h-15 w-15 rounded-full`}
              />

              {/* Artist Name */}
              <Text style={className`text-lg text-white flex-1`}>
                {item.artist || "Unknown Artist"}
              </Text>

              {/* Play Button */}
              <TouchableOpacity
                onPress={() => playMusic(item.url)}
                style={className`bg-green-500 px-3 py-2 rounded-lg`}
              >
                <Text style={className`text-white`}>Play</Text>
              </TouchableOpacity>

              {/* Stop Button */}
              <TouchableOpacity
                onPress={stopMusic}
                style={className`bg-red-500 px-3 py-2 rounded-lg ml-2`}
              >
                <Text style={className`text-white`}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={className`text-gray-400 text-center mt-4`}>
              No artists found.
            </Text>
          }
        />
      </ScrollView>
    </View>
  );
};

export default Artists;
