import * as Commands from "../../common/commands";

class PlaylistsPage {
  constructor(app) {
    this.app = app;
  }
  
  initialize() {
    const app = this.app;
    
    this.app.broker.registerHandler(Commands.SCROLL_UP_PLAYLIST, () => {
      app.state.playlistPage.currentPlaylistId = app.getVisiblePlaylistsOnPlaylistPage().previous.id;
      app.updateUi();
    });

    this.app.broker.registerHandler(Commands.SCROLL_DOWN_PLAYLIST, () => {
      app.state.playlistPage.currentPlaylistId = app.getVisiblePlaylistsOnPlaylistPage().next.id;
      app.updateUi();
    });

    this.app.broker.registerHandler(Commands.SELECT_PLAYLIST, async () => {
      await app.apiClient.playMusic(app.state.playlistPage.currentPlaylistId);
      
      if (app.state.playerPage.heartRateShuffleEnabled) {
        app.broker.runCommandHandlers(Commands.TOGGLE_HEART_RATE_SHUFFLE);
      }
      
      app.state.page = 'player';
      setTimeout(() => app.broker.runCommandHandlers(Commands.UPDATE_PLAYER_STATE), 2000);
    });

    console.log(`[Companion] Initialized playlists page`);
  }
}

export default PlaylistsPage;
