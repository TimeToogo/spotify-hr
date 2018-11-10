import document from "document";
import * as messaging from "messaging";
import HearRateTracker from "./heart-rate";
import { me as device } from "device";

class Ui {
  savedState = [];
  currentState = null;

  elements = {
    logo: document.getElementById('logo-button'),
    page: {
      loading: {
        container: document.getElementById('loading'),
      },
      connecting: {
        container: document.getElementById('connecting'),
      },
      loginToSpotify: {
        container: document.getElementById('login-to-spotify'),
      },
      noInternet: {
        container: document.getElementById('no-internet'),
      },
      noActiveDevice: {
        container: document.getElementById('no-active-device'),
      },
      menu: {
        container: document.getElementById('menu'),
        playerButton: document.getElementById('menu-player-button'),
        playlistsButton: document.getElementById('menu-playlists-button'),
        volumeButton: document.getElementById('menu-volume-button'),
      },
      player: {
        container: document.getElementById('player'),
        backButton: document.getElementById('back-button'),
        playButton: document.getElementById('play-button'),
        pauseButton: document.getElementById('pause-button'),
        nextButton: document.getElementById('next-button'),
        menuButton: document.getElementById('player-menu-button'),
        clock: document.getElementById('clock'),
        heartRateShuffleButton: document.getElementById('heart-rate-shuffle-button'),
        heartRateShuffleIcon: document.getElementById('heart-rate-shuffle-icon'),
        currentPlaylistName: document.getElementById('player-current-playlist-name'),
        currentTrackName: document.getElementById('player-current-track-name'),
        currentArtistName: document.getElementById('player-current-artist-name'),
        currentHeartRate: document.getElementById('heart-rate-number'),
        trackProgressBarContainer: document.getElementById('track-progress-bar-container'),
        trackProgressBarFill: document.getElementById('track-progress-bar-fill'),
      },
      playlists: {
        container: document.getElementById('playlists-picker'),
        previousButton: document.getElementById('previous-playlist-button'),
        currentButton: document.getElementById('current-playlist-button'),
        nextButton: document.getElementById('next-playlist-button'),
        previousText: document.getElementById('previous-playlist-text'),
        currentText: document.getElementById('current-playlist-text'),
        nextText: document.getElementById('next-playlist-text'),
        doneButton: document.getElementById('playlists-done-button'),
      },
      volume: {
        container: document.getElementById('volume'),
        increaseButton: document.getElementById('increase-volume-button'),
        decreaseButton: document.getElementById('decrease-volume-button'),
        volumeBarContainer: document.getElementById('volume-bar-container'),
        volumeBarFill: document.getElementById('volume-bar-fill'),
        doneButton: document.getElementById('volume-done-button'),
      }
    },
    shared: {
      buttons: document.getElementsByClassName('button'),
    }
  };

  initialize() {
    if (!device.screen) { 
      device.screen = { width: 348, height: 250 };
    }
    
    console.log(`Dimensions: ${device.screen.width}x${device.screen.height}`);
  }

  render(state) {
    let elements = this.elements;
    
    console.log(`Rendering page ${state.page}`);

    // Current page
    elements.page.loading.container.style.display = state.page === 'loading' ? 'inline' : 'none';
    elements.page.connecting.container.style.display = state.page === 'connecting' ? 'inline' : 'none';
    elements.page.loginToSpotify.container.style.display = state.page === 'login-to-spotify' ? 'inline' : 'none';
    elements.page.noInternet.container.style.display = state.page === 'no-internet' ? 'inline' : 'none';
    elements.page.noActiveDevice.container.style.display = state.page === 'no-active-device' ? 'inline' : 'none';
    elements.page.menu.container.style.display = state.page === 'menu' ? 'inline' : 'none';
    elements.page.player.container.style.display = state.page === 'player' ? 'inline' : 'none';
    elements.page.playlists.container.style.display = state.page === 'playlists' ? 'inline' : 'none';
    elements.page.volume.container.style.display = state.page === 'volume' ? 'inline' : 'none';

    if (state.page === 'player') {
      this.renderPlayerPage(state);
    }
    
    if (state.page === 'playlists') {
      this.renderPlaylistsPage(state);
    }
    
    if (state.page === 'volume') {
      this.renderVolumePage(state);
    }
    
    this.currentState = state;
  }

  renderPlayerPage(state) {
    let elements = this.elements;
    
    elements.page.player.playButton.style.display = state.playerPage.isPlaying ? 'none' : 'inline';
    elements.page.player.pauseButton.style.display = state.playerPage.isPlaying ? 'inline' : 'none';
    elements.page.player.heartRateShuffleIcon.style.display = state.playerPage.heartRateShuffleEnabled ? 'inline' : 'none';
    
    elements.page.player.currentPlaylistName.text = state.playerPage.currentPlaylistName;
    elements.page.player.currentTrackName.text = state.playerPage.currentTrackName;
    elements.page.player.currentArtistName.text = state.playerPage.currentArtistName;
    this.renderHeartRate(state.playerPage.currentHeartRate);
  }

  renderPlayerProgressBar(percent) {
    let elements = this.elements;
    
    const container = elements.page.player.trackProgressBarContainer;
    elements.page.player.trackProgressBarFill.width = device.screen.width * Math.min(1, percent || 0);
  }

  renderPlaylistsPage(state) {
    let elements = this.elements;
    
    elements.page.playlists.previousText.text = state.playlistsPage.previous;
    elements.page.playlists.currentText.text = state.playlistsPage.current;
    elements.page.playlists.nextText.text = state.playlistsPage.next;
  }

  renderVolumePage(state) {
    let elements = this.elements;
    
    const container = elements.page.volume.volumeBarContainer;
    const volume = state.volumePage.currentVolume / 100;
    
    elements.page.volume.volumeBarFill.y = container.y + (container.height * (1 - volume));
    elements.page.volume.volumeBarFill.height = container.height * volume;
  }

  renderHeartRate(heartRate) {
    this.elements.page.player.currentHeartRate.text = heartRate || '';
  }

  saveState() {
    this.savedState.push(JSON.parse(JSON.stringify(this.currentState)));
  }

  restoreSavedStateOrDefault(defaultState) {
    this.render(this.savedState.pop() || defaultState);
  }

  getElementChildren(element) {
    if (!element.firstChild) {
      return [];
    }
    
    let children = [element.firstChild];
    let current = element.firstChild;
    
    while (current = current.nextSibling) {
      children.push(current);
    }
    
    return children;
  }
}
        
export default Ui;