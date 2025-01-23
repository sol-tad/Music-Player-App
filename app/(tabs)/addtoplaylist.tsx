import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import className from "twrnc";
import library from "../../assets/data/library.json"; // Songs data

const AddToPlayList = () => {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState(library);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load playlists from AsyncStorage
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const storedPlaylists = await AsyncStorage.getItem("playlists");
        if (storedPlaylists) {
          setPlaylists(JSON.parse(storedPlaylists));
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    fetchPlaylists();
  }, []);

  // Add a song to the selected playlist
  const addToPlaylist = async (playlistName) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.name === playlistName) {
        if (playlist.songs.some((song) => song.url === selectedSong.url)) {
          Alert.alert("Error", "This song is already in the playlist.");
          return playlist;
        }
        return { ...playlist, songs: [...playlist.songs, selectedSong] };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists);
    try {
      await AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
      Alert.alert("Success", `Song added to ${playlistName}!`);
    } catch (error) {
      console.error("Error updating playlists:", error);
    }
    setIsModalVisible(false);
  };

  const renderSong = ({ item }) => (
    <View
      style={className`flex-row justify-between items-center bg-gray-800 p-4 mb-2 rounded-lg`}
    >
      <Image
        source={{ uri: item.artwork }}
        style={className`h-14 w-14 rounded-lg`}
      />
      <Text style={className`flex-1 ml-4 text-white`}>{item.title}</Text>
      <TouchableOpacity
        style={className`bg-blue-500 px-4 py-2 rounded-lg`}
        onPress={() => {
          setSelectedSong(item);
          setIsModalVisible(true);
        }}
      >
        <Text style={className`text-white`}>Add to Playlist</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlaylistOption = ({ item }) => (
    <TouchableOpacity
      style={className`bg-gray-700 p-3 mb-2 rounded-lg`}
      onPress={() => addToPlaylist(item.name)}
    >
      <Text style={className`text-white text-lg`}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={className`flex-1 bg-gray-900 p-4`}>
      <Text style={className`text-white text-2xl font-bold mb-4`}>
        All Songs
      </Text>

      {/* Songs List */}
      <FlatList
        data={songs}
        keyExtractor={(item) => item.url}
        renderItem={renderSong}
        ListEmptyComponent={
          <Text style={className`text-gray-400 text-center`}>
            No songs available.
          </Text>
        }
      />

      {/* Modal for selecting playlist */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View
          style={className`flex-1 bg-black bg-opacity-70 justify-center items-center`}
        >
          <View style={className`bg-gray-800 w-4/5 p-4 rounded-lg`}>
            <Text style={className`text-white text-xl font-bold mb-4`}>
              Select Playlist
            </Text>
            {playlists.length > 0 ? (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.name}
                renderItem={renderPlaylistOption}
              />
            ) : (
              <Text style={className`text-gray-400 text-center`}>
                No playlists available. Create one first.
              </Text>
            )}
            <Button
              title="Close"
              color="#FF0000"
              onPress={() => setIsModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddToPlayList;
