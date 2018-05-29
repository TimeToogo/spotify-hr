import HeartRateShuffleAlgorithm from './heart-rate-shuffle';
import * as Commands from "../../common/commands";

const PLAYER_POLL_INTERVAL = 10 * 1000;

class PlayerPage {
  constructor(app) {
    this.app = app;
    this.heartRateShuffle = new HeartRateShuffleAlgorithm(this.app);
  }
  
  initialize() {
    const app = this.app;
    
    app.broker.registerHandler(Commands.PREVIOUS_TRACK, async () => {
                                                        
      if (app.state.playerPage.heartRateShuffleEnabled) {
        await this.heartRateShuffle.forcePreviousTrack();
      } else {
        await app.apiClient.previousTrack();
      }
                
      setTimeout(() => this.updatePlayerState(), 2000);
    });
                               
    app.broker.registerHandler(Commands.PLAY_MUSIC, async () => {
      await app.apiClient.playMusic();
      app.state.playerPage.isPlaying = true;
      app.updateUi();
    });

    app.broker.registerHandler(Commands.PAUSE_MUSIC, async () => {
      await app.apiClient.pauseMusic()
      app.state.playerPage.isPlaying = false;
      app.updateUi();
    });

    app.broker.registerHandler(Commands.NEXT_TRACK, async () => {
      
      if (app.state.playerPage.heartRateShuffleEnabled) {
        await this.heartRateShuffle.forceNextTrack();
      } else {
        await app.apiClient.nextTrack();
      }

      setTimeout(() => this.updatePlayerState(), 2000);
    });

    app.broker.registerHandler(Commands.TOGGLE_HEART_RATE_SHUFFLE, async () => {
      if (!app.state.playerPage.currentPlaylistId) {
        return;
      }
      
      app.state.playerPage.heartRateShuffleEnabled = !app.state.playerPage.heartRateShuffleEnabled;
      
      if (app.state.playerPage.heartRateShuffleEnabled) {
        this.heartRateShuffle.enable(); 
      } else {
        this.heartRateShuffle.disable();
      }
      
      app.updateUi();
    });
    
    
    app.broker.registerHandler(Commands.UPDATE_PLAYER_STATE, async () => await this.updatePlayerState());
    
    setInterval(() => app.broker.runCommandHandlers(Commands.UPDATE_PLAYER_STATE), PLAYER_POLL_INTERVAL);
    
    console.log(`[Companion] Initialized player page`);
  }
  
  async updatePlayerState() {
    const app = this.app;
    
    if (!app.apiClient) {
      return;
    }

    let data = await app.apiClient.getPlaybackState();
    
    console.log(`Updating player state: ${JSON.stringify(data)}`)

    app.state.playerPage.isPlaying = data.isPlaying;
    app.state.playerPage.currentPlaylistId = data.playlistId;
    app.state.playerPage.currentTrack = data.currentTrack;
    app.state.playerPage.durationMs = data.durationMs;
    app.state.playerPage.progressMs = data.progressMs;
    app.state.playerPage.millisecondsLeftOnTrack = data.durationMs - data.progressMs;
    app.state.playerPage.repeatMode = data.repeatMode;
    app.state.playerPage.shuffleMode = data.shuffleMode;
    app.state.playerPage.volumePercent = data.volumePercent;
    app.state.playerPage.recievedUpdateAt = new Date().getTime();

    if (app.state.playlists && data.playlistId && !app.hasPlaylistId(data.playlistId)) {
      let playlist = await app.apiClient.getPlaylist(data.playlistId);
      app.state.playlists.push(playlist);

      console.log(`Loaded extra playlist: ${JSON.stringify(playlist)}`);
    }
    
    if (app.state.page !== 'playlists') {
      app.state.playlistPage.currentPlaylistId = app.state.playerPage.currentPlaylistId;
    }

    if (data.hasActiveDevice && (app.state.page === 'no-active-device' || app.state.page === 'loading')) {
      app.state.page = 'player';
    }

    if (!data.hasActiveDevice) {
      app.state.page = 'no-active-device';
    }

    app.updateUi();
   }
}

export default PlayerPage;
