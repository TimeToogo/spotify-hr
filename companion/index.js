import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { getSpotifyApiToken } from "./spotify-oauth";
import ApiClient from './spotify-api-client';
import MessageBroker from "../common/message-broker";
import * as Commands from "../common/commands";
import App from './app';
import HeartRateTracker from "./components/heart-rate";
import UserProfile from "./components/user-profile";
import PlayerPage from "./components/player";
import PlaylistsPage from "./components/playlists";
import VolumePage from "./components/volume";
import Logo from "./components/logo";
import PhysicalButtons from "./components/physical-buttons";
import Menu from "./components/menu";

const broker = new MessageBroker('[Companion]');
const app = new App(broker);

const heartRateTracker = new HeartRateTracker(app);
const userProfile = new UserProfile(app);
const playerPage = new PlayerPage(app);
const playlistsPage = new PlaylistsPage(app);
const volumePage = new VolumePage(app);
const logo = new Logo(app);
const physicalButtons = new PhysicalButtons(app);
const menu = new Menu(app);

broker.onConnectionOpened(async () => {
  await initialize();
  
  setInterval(() => generateAccessToken(), 30 * 60 * 1000); // Every 30 min
});

// A user changes settings
settingsStorage.onchange = async (evt) => {
  if (evt.key === "spotify_oauth_code" && evt.newValue) {
    console.log(`Recieved OAuth code`)
    let token = await getSpotifyApiToken(evt.newValue);
    settingsStorage.setItem("spotify_refresh_token", token.refresh_token);
    await initialize();
  }
  
  if (evt.key === "spotify_refresh_token") {
    console.log(`Recieved Refresh Token`)
    settingsStorage.setItem("spotify_refresh_token", evt.newValue);
    await generateAccessToken();
  }
};

// Refresh access token
const generateAccessToken = async () => {
  app.accessToken = null;
  app.apiClient = null;
  
  const refreshToken = settingsStorage.getItem("spotify_refresh_token");
  
  if (!refreshToken) {
    app.state.page = 'login-to-spotify';
    app.updateUi();
    return;
  }
  
  let token = await getSpotifyApiToken(refreshToken, "refresh_token");
  
  if (token.error) {
    console.log(`[Companion] Error while generating access token  ${JSON.stringify(token)}`);
    settingsStorage.setItem("spotify_refresh_token", "");
    app.state.page = 'login-to-spotify';
    app.updateUi();
    return;
  }
  
  console.log(`[Companion] Generated access token  ${JSON.stringify(token)}`);
  
  settingsStorage.setItem("spotify_access_token", token.access_token);

  app.accessToken = token.access_token;
  app.apiClient = new ApiClient(app.accessToken);
}

const initialize = async () => {
  console.log(`Initializing app...`);
  
  try {
    await generateAccessToken();
  } catch (error) {
    console.log(`[Companion] Error while generating access token  ${error}`);
    app.state.page = 'no-internet';
    app.updateUi();
    setTimeout(() => initialize(), 10 * 1000);
    return;
  }
  
  if (!app.apiClient) {
    return;
  }
  
  if (app.state.page === 'login-to-spotify') {
    app.state.page = 'loading';
  }
  
  app.apiClient.getUserProfile()
    .then(results => {
      settingsStorage.setItem("spotify_current_user_name", results.name);
      app.state.user = results;
      console.log(`Loaded user profile ${JSON.stringify(results)}`);
      app.updateUi();
    });
  
  app.state.playlists = null;
  app.apiClient.getPlaylists()
    .then(results => {
      app.state.playlists = results;
      console.log(`Loaded ${app.state.playlists.length} playlists`);
      playerPage.updatePlayerState();
    });
};

heartRateTracker.initialize();
userProfile.initialize();
playerPage.initialize();
playlistsPage.initialize();
volumePage.initialize();
logo.initialize();
physicalButtons.initialize();
menu.initialize();

app.updateUi();