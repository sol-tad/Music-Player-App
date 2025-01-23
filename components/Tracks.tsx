import React, { useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import className from "twrnc";
import data from "../assets/data/library.json";
import Track from "./Track";
import MusicScreen from "./MusicScreen";

const Tracks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null); // Track the selected song

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredData(data);
    } else {
      const results = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(query.toLowerCase()) ||
          item.artist?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(results);
    }
  };

  // Toggle popup visibility and set the selected song
  const togglePopup = (item) => {
    setSelectedSong(item); // Set the selected song
    setPopupVisible(!popupVisible); // Toggle the modal
  };

  return (
    <>
      <View style={className`flex-1 gap-4 p-4 bg-gray-900`}>
        {/* Search Input */}
        <View
          style={className`flex-row items-center bg-gray-800 p-3 rounded-lg`}
        >
          <TextInput
            style={className`flex-1 text-white`}
            placeholder="Search"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Songs List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.url}
          renderItem={({ item }) => (
            <Track
              onpress={() => togglePopup(item)} // Pass the selected song
              image={item.artwork}
              title={item.title}
              name={item.artist}
            />
          )}
          ListEmptyComponent={
            <Text style={className`text-gray-400 text-center mt-4`}>
              No songs available.
            </Text>
          }
        />
      </View>

      {/* Popup Music Screen */}
      {popupVisible && (
        <MusicScreen
          onpress={() => setPopupVisible(false)} // Close the modal
          song={selectedSong} // Pass the selected song
        />
      )}
    </>
  );
};

export default Tracks;
