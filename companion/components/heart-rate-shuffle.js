const POLL_SONG_INTERVAL = 1000;
const SCHEDULE_NEXT_SONG_THRESHHOLD = 30 * 1000;

/**
 * Spotify's web API doesn't support the song queue
 * hence we have to play matching songs on the fly.
 */
class HeartRateShuffleAlgorithm {
  constructor(app) {
    this.app = app;
  }
  
  async enable() {
    console.log(`Started heart rate shuffle algorithm`);
    
    this.trackHistory = [];
    
    await this.getEnergyLevelsOfTracksInCurrentPlaylist();
    this.previousPlayerState = JSON.parse(JSON.stringify(this.app.state.playerPage));
    this.disableShuffleAndRepeatState();
    this.startPollingCurrentSong();
  }
  
  disable() {
    console.log(`Stopped heart rate shuffle algorithm`);
    
    this.heartRatePlaylist = null;
    this.currentTrackEnergyLevels = null;
    clearInterval(this.pollCurrentSongFinishedIntervalId);
    clearTimeout(this.resumePollingTimeoutId);
    clearTimeout(this.switchPlaylistTimeoutId);
    this.restorePlayerState();
    this.trackHistory = [];
    this.heartRateAtPreviousSong = null;
  }
  
  async forcePreviousTrack() {
    if (this.trackHistory.length <= 1) {
      return;
    }
    
    clearTimeout(this.switchPlaylistTimeoutId);
    this.trackHistory.pop();
    const previousSongId = this.trackHistory[this.trackHistory.length - 1];
    
    await this.app.apiClient.playMusic(this.app.state.playerPage.currentPlaylistId, previousSongId);
  }
  
  async forceNextTrack() {
    clearTimeout(this.switchPlaylistTimeoutId);
    const matchingSong = this.matchSongBasedOffHeartRate();
    
    await this.app.apiClient.playMusic(this.app.state.playerPage.currentPlaylistId, matchingSong.id);
  }
  
  async getEnergyLevelsOfTracksInCurrentPlaylist() {
    let trackIds = await this.app.apiClient.getTrackIdsFromPlaylist(this.app.state.playerPage.currentPlaylistId);
    let energyLevels = await this.app.apiClient.getTrackEnergyRatings(trackIds);
    this.currentTrackEnergyLevels = energyLevels;
    console.log(`Downloaded energy levels of tracks in current playlist`);
  }
  
  async disableShuffleAndRepeatState() {
    this.app.apiClient.setRepeatMode('off');
    this.app.apiClient.setShuffleMode(false);
  }
  
  async pollCurrentSongForQueueingNextTrack() {
    if (this.app.getInferredTimeLeftOnCurrentTrack() > SCHEDULE_NEXT_SONG_THRESHHOLD) {
      return;
    }
    
    console.log(`Ready to queue next song: ${this.app.getInferredTimeLeftOnCurrentTrack() / 1000} seconds left on current track`);
    
    const matchingSong = this.matchSongBasedOffHeartRate();
    
    this.attemptToSwitchToTrackWhenCurrentTrackFinishes(matchingSong.id);
    
    this.stopPollingSongFor(this.app.getInferredTimeLeftOnCurrentTrack() + 15 * 1000);
  }
  
  stopPollingSongFor(milliseconds) {
    clearInterval(this.pollCurrentSongFinishedIntervalId);
    this.resumePollingTimeoutId = setTimeout(() => this.startPollingCurrentSong(), milliseconds);
  }
  
  startPollingCurrentSong() {
      this.pollCurrentSongFinishedIntervalId = setInterval(() => this.pollCurrentSongForQueueingNextTrack(), POLL_SONG_INTERVAL);
  }
  
  attemptToSwitchToTrackWhenCurrentTrackFinishes(trackId) {
    this.switchPlaylistTimeoutId = setTimeout(async () => {
      if (!this.app.state.playerPage.isPlaying) {
        return;
      }
      
      this.app.apiClient.playMusic(this.app.state.playerPage.currentPlaylistId, trackId);
      
      console.log(`Playing managed heart rate playlist`);
    }, this.app.getInferredTimeLeftOnCurrentTrack() - 1000)
  }
  
  // This is where the magic happens...
  matchSongBasedOffHeartRate() {
    console.log(`Matching song based off current heart rate`);
    
    // Heart rate
    const maxHeartRate = 220 - (this.app.state.userAge || 20);
    const restingHeartRate = this.app.state.restingHeartRate || 65;
    const currentHeartRate = this.app.state.currentHeartRate;
    const currentHeartRateIntensity = (currentHeartRate - restingHeartRate) / (maxHeartRate - restingHeartRate);
    console.log(`Current heart rate intensity: ${currentHeartRateIntensity.toFixed(2)} (${currentHeartRate} bpm) (${maxHeartRate} max) (${restingHeartRate} resting)`);
    
    // Song matching
    const songsNotInHistory = [];
    
    for (let trackId in this.currentTrackEnergyLevels) {
      if (this.trackHistory.indexOf(trackId) !== -1) {
        continue;
      }
      
      songsNotInHistory.push({id: trackId, energy: this.currentTrackEnergyLevels[trackId]});
    }
    
    const amountOfSongsInPool = Math.max(20, Math.ceil(songsNotInHistory.length / 10));
    
    const songsWithRelativeIntensity = songsNotInHistory
      .map(i => {
        return {id: i.id, relativeIntensity: i.energy - currentHeartRateIntensity};
      });
    
    const closestSongsToIntensity = songsWithRelativeIntensity
      .sort((a, b) => Math.abs(a.relativeIntensity) - Math.abs(b.relativeIntensity));
    
    let songPool = closestSongsToIntensity.slice(0, amountOfSongsInPool);
    
    if (this.heartRateAtPreviousSong && amountOfSongsInPool > 1) {
      const heartRateDiffernceSinceLastSong = currentHeartRate - this.heartRateAtPreviousSong;
      
      // If there's a signicant differnce in heart rate since the last
      // song we favour songs with intensities in the same direction as the change in heart rate
      
      if (heartRateDiffernceSinceLastSong >= 10) {
        songPool = songPool
            .sort((a, b) => b.relativeIntensity - a.relativeIntensity) // Sort Descending
            .slice(0, Math.ceil(amountOfSongsInPool / 2));
      }
      
      if (heartRateDiffernceSinceLastSong <= -10) {
        songPool = songPool
            .sort((a, b) => a.relativeIntensity - b.relativeIntensity) // Sort Descending
            .slice(0, Math.ceil(amountOfSongsInPool / 2));
      }
    }
                   
    console.log(`Song pool: ${JSON.stringify(songPool)}`);
    const song = songPool[Math.floor(Math.random() * songPool.length)];
    
    this.trackHistory.push(song.id);
    this.heartRateAtPreviousSong = currentHeartRate;
    
    if (songsNotInHistory.length === 1) {
      this.trackHistory = [];
    }
    
    console.log(`Selected song: ${song.id}`);
    return song;
  }
  
  restorePlayerState() {
    if (!this.previousPlayerState) {
      return;
    }
    
    this.app.apiClient.setRepeatMode(this.previousPlayerState.repeatMode);
    this.app.apiClient.setShuffleMode(this.previousPlayerState.shuffleMode);

    this.previousPlayerState = null;
    console.log(`Restored previous playing state`);
  }
}

export default HeartRateShuffleAlgorithm;
