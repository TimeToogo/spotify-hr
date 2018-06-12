import document from "document";
import * as messaging from "messaging";
import { ApiClient } from "./spotify-api-client";
import * as Commands from "../common/commands";

class App {
  broker = null;
  refreshToken = null;
  accessToken = null;
  apiClient = null;

  state = {
    user: null,
    page: 'loading',
    userAge: 30,
    currentHeartRate: null,
    restingHeartRate: 65,
    playlists: null,
    playerPage: {
      currentPlaylistId: null,
      currentTrack: {
        id: null,
        name: null,
        artistName: null,
      },
      overrideCurrentPlaylistName: null,
      isPlaying: false,
      durationMs: null,
      progressMs: null,
      millisecondsLeftOnTrack: null,
      shuffleMode: null,
      repeatMode: null,
      heartRateShuffleEnabled: false,
      recievedUpdateAt: null,
      volumePercent: null,
    },
    playlistPage: {
      currentPlaylistId: null,
    }
  };

  constructor(broker) {
    this.broker = broker;
  }

  hasPlaylistId(id) {
    return this.state.playlists.filter(i => i.id === id).length > 0;
  }

  getCurrentPlayingPlaylist() {
     return (this.state.playlists || [])
      .filter(i => i.id === this.state.playerPage.currentPlaylistId)[0] || {id: null, name: 'Unknown'};
  }

  getVisiblePlaylistsOnPlaylistPage() {
    const allPlaylists = [].concat(this.state.playlists || []);

    const key = allPlaylists
      .map((i, key) => {
        return {key, id: i.id};
      })
      .filter(i => i.id === this.state.playlistPage.currentPlaylistId)
      .map(i => i.key)[0];

    const current = key !== undefined ? allPlaylists[key] : null;
    const previous = key > 0 ? allPlaylists[key - 1] : allPlaylists[allPlaylists.length - 1];
    const next = key < allPlaylists.length - 1 ? allPlaylists[key + 1] : allPlaylists[0];

    return {current, previous, next};
  }

  getInferredTimeLeftOnCurrentTrack() {
    const millisecondsLeftOnTrack = this.state.playerPage.millisecondsLeftOnTrack;
    
    if (!millisecondsLeftOnTrack) {
      return null;
    }
    
    if (!this.state.playerPage.recievedUpdateAt) {
      return millisecondsLeftOnTrack;
    }
    
    const durationSinceUpdate = new Date().getTime() - this.state.playerPage.recievedUpdateAt;
    
    return millisecondsLeftOnTrack - durationSinceUpdate;
  }

  getVisisblePlaylistName() {
     return this.state.playerPage.overrideCurrentPlaylistName || this.getCurrentPlayingPlaylist().name;
  }

  getUiState() {
    let playlistsPage = this.getVisiblePlaylistsOnPlaylistPage();
    
    return {
      page: this.state.page,
      playerPage: {
        currentPlaylistName: this.getVisisblePlaylistName(),
        currentTrackName: this.state.playerPage.currentTrack.name || 'Unknown',
        currentArtistName: this.state.playerPage.currentTrack.artistName || 'Unknown',
        isPlaying: this.state.playerPage.isPlaying,
        heartRateShuffleEnabled: this.state.playerPage.heartRateShuffleEnabled,
        currentHeartRate: this.state.currentHeartRate,
        progressMs: this.state.playerPage.progressMs,
        durationMs: this.state.playerPage.durationMs,
        recievedUpdateAt: this.state.playerPage.recievedUpdateAt,
      },
      playlistsPage: {
        previous: playlistsPage.previous ? playlistsPage.previous.name : null,
        current: playlistsPage.current ? playlistsPage.current.name : 'Unknown',
        next: playlistsPage.next ? playlistsPage.next.name : null,
      },
      volumePage: {
        currentVolume: this.state.playerPage.volumePercent,
      }
    };
  }

  updateUi() {
    this.broker.sendCommand(Commands.UPDATE_UI, this.getUiState());
  }
}

export default App;