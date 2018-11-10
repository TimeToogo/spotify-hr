import document from "document";
import * as messaging from "messaging";
import MessageBroker from "../common/message-broker";
import * as Commands from "../common/commands";
import Ui from './ui';
import HeartRateTracker from "./components/heart-rate";
import UserProfile from "./components/user-profile";
import PlayerPage from "./components/player";
import Clock from "./components/clock";
import PlaylistsPage from "./components/playlists";
import VolumePage from "./components/volume";
import Logo from "./components/logo";
import PhysicalButtons from "./components/physical-buttons";
import OnScreenButtons from "./components/on-screen-buttons";
import Menu from "./components/menu";

const broker = new MessageBroker('[FitBit]');

const ui = new Ui();

const heartRateTracker = new HeartRateTracker(ui, broker);
const userProfile = new UserProfile(ui, broker);
const playerPage = new PlayerPage(ui, broker);
const playlistsPage = new PlaylistsPage(ui, broker);
const clock = new Clock(ui, broker);
const volumePage = new VolumePage(ui, broker);
const logo = new Logo(ui, broker);
const physicalButtons = new PhysicalButtons(ui, broker);
const onScreenButtons = new OnScreenButtons(ui, broker);
const menu = new Menu(ui, broker);

let connected = false;
heartRateTracker.initialize();
userProfile.initialize();
playerPage.initialize();
clock.initialize();
playlistsPage.initialize();
volumePage.initialize();
logo.initialize();
physicalButtons.initialize();
onScreenButtons.initialize();
menu.initialize();
ui.initialize();

broker.registerHandler(Commands.UPDATE_UI, (state) => {
  ui.render(state);
});

broker.onConnectionLost(() => {
  ui.saveState();
  ui.render({page: 'connecting'});
  connected = false;
});

broker.onConnectionOpened(() => {
  ui.restoreSavedStateOrDefault({page: 'loading'});
  connected = true;
});

ui.render({page: 'loading'});

setTimeout(() => {
  if (!connected) {
    ui.render({page: 'connecting'});
  }
}, 10 * 1000);
