import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import className from "twrnc";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [sound, setSound] = useState(null);

  // Load playlists from AsyncStorage
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const storedPlaylists = await AsyncStorage.getItem("playlists");
        if (storedPlaylists) {
          setPlaylists(JSON.parse(storedPlaylists));
        }
      } catch (error) {
        console.error("Error loading playlists:", error);
      }
    };
    loadPlaylists();
  }, []);

  // Save playlists to AsyncStorage
  const savePlaylists = async (updatedPlaylists) => {
    try {
      await AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error("Error saving playlists:", error);
    }
  };

  // Handle playlist creation
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a valid playlist name.");
      return;
    }

    if (playlists.some((playlist) => playlist.name === newPlaylistName)) {
      Alert.alert("Error", "A playlist with this name already exists.");
      return;
    }

    const updatedPlaylists = [
      ...playlists,
      { name: newPlaylistName, songs: [] }, // Add songs here if needed
    ];
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
    setNewPlaylistName("");
    setIsCreating(false);
    Alert.alert("Success", "Playlist created!");
  };
  

  // Handle playlist deletion
  const deletePlaylist = (playlistName) => {
    const updatedPlaylists = playlists.filter(
      (playlist) => playlist.name !== playlistName
    );
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
    Alert.alert("Success", "Playlist deleted!");
  };

  // Handle song removal from a playlist
  const removeSongFromPlaylist = (playlistName, songUrl) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.name === playlistName) {
        // Filter out the song to be removed
        const updatedSongs = playlist.songs.filter(
          (song) => song.url !== songUrl
        );
        return { ...playlist, songs: updatedSongs };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);

    // Update the selectedPlaylist state to reflect the changes immediately
    const updatedSelectedPlaylist = updatedPlaylists.find(
      (playlist) => playlist.name === playlistName
    );
    setSelectedPlaylist(updatedSelectedPlaylist);

    Alert.alert("Success", "Song removed from playlist!");
  };

  // Play a song
  const playSong = async (song) => {
    try {
      if (sound) {
        await sound.unloadAsync(); // Stop current sound
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: song.url,
      });
      setSound(newSound);
      setCurrentPlaying(song.url);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Pause a song
  const pauseSong = async () => {
    if (sound) {
      await sound.pauseAsync();
      setCurrentPlaying(null);
    }
  };

  // Render songs for the selected playlist
  const renderSongs = (songs) => (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.url}
      renderItem={({ item }) => (
        <View
          style={className`flex-row justify-between items-center bg-gray-800 p-4 rounded-lg mb-2`}
        >
          <Text style={className`text-white`}>{item.title}</Text>
          <View style={className`flex-row gap-2`}>
            {currentPlaying === item.url ? (
              <TouchableOpacity
                onPress={pauseSong}
                style={className`bg-red-500 px-4 py-2 rounded-lg`}
              >
                <Text style={className`text-white`}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => playSong(item)}
                style={className`bg-green-500 px-4 py-2 rounded-lg`}
              >
                <Text style={className`text-white`}>Play</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                removeSongFromPlaylist(selectedPlaylist.name, item.url)
              }
              style={className`bg-red-500 px-4 py-2 rounded-lg`}
            >
              <Text style={className`text-white`}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={className`text-gray-400 text-center`}>
          No songs in this playlist.
        </Text>
      }
    />
  );

  return (
    <View style={className`flex-1 bg-gray-900 p-4`}>
      {selectedPlaylist ? (
        <>
          <TouchableOpacity
            style={className`bg-blue-500 p-3 mb-4 rounded-lg`}
            onPress={() => setSelectedPlaylist(null)}
          >
            <Text style={className`text-white text-center`}>
              Back to Playlists
            </Text>
          </TouchableOpacity>
          <Text style={className`text-white text-xl font-bold mb-4`}>
            {selectedPlaylist.name}
          </Text>
          {renderSongs(selectedPlaylist.songs)}
        </>
      ) : (
        <>
          {isCreating ? (
            <View style={className`mb-4`}>
              <TextInput
                placeholder="Enter playlist name"
                placeholderTextColor="#888"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                style={className`bg-gray-800 text-white p-3 rounded-lg`}
              />
              <TouchableOpacity
                style={className`bg-blue-500 p-3 mt-2 rounded-lg`}
                onPress={createPlaylist}
              >
                <Text style={className`text-white text-center`}>
                  Create Playlist
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={className`bg-red-500 p-3 mt-2 rounded-lg`}
                onPress={() => setIsCreating(false)}
              >
                <Text style={className`text-white text-center`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={className`bg-green-500 p-3 mb-4 rounded-lg`}
              onPress={() => setIsCreating(true)}
            >
              <Text style={className`text-white text-center`}>
                + Create Playlist
              </Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View
                style={className`flex-row justify-between items-center mb-4 bg-gray-800 p-4 rounded-lg`}
              >
                <TouchableOpacity
                  onPress={() => setSelectedPlaylist(item)}
                  style={className`flex-1`}
                >
                  <Text style={className`text-white text-lg font-bold`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={className`bg-red-500 px-3 py-1 rounded-lg`}
                  onPress={() => deletePlaylist(item.name)}
                >
                  <Text style={className`text-white`}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={className`text-gray-400 text-center`}>
                No playlists yet! Create one to get started.
              </Text>
            }
          />
        </>
      )}
    </View>
  );
};

export default Playlists;
