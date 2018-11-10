import { urlEncode } from "../common/url-encode";

class ApiClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }
  
  async request(method, endpoint, body) {
    try {
      const fullEndpoint = 'https://api.spotify.com/' + endpoint;
      console.log(`Making API request: ${method} ${fullEndpoint}`);

      let params = {
          method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.accessToken,
              'Accept': 'application/json'
          },
      };

      if (method !== 'GET' && method !== 'HEAD') {
        params.body = body ? JSON.stringify(body) : '';
      }

      let response = await fetch(fullEndpoint, params);
      let text;
      try {
        text = await response.text();
      } catch(error) {
        console.log(`Empty API response: ${method} ${endpoint} ${response.status} ${error}`);
        text = null;
      }
      let data = text ? JSON.parse(text) : null;
      
      console.log(`Response from Spotify API: ${text ? text.substring(1, 150) : null}`)
      
      return data;
    } catch (error) {
      console.log(`API request error: ${method} ${endpoint} ${error}`);
    }
  }
  
  async requestPaginated(endpoint, batchAmount) {
    let offset = 0;
    let items = [];
    let pageItems;
    
    do {
      const url = endpoint + '?' + urlEncode({offset, limit: batchAmount});
      pageItems = (await this.request('GET', url, null)).items;
      
      offset += batchAmount;
      items = items.concat(pageItems);
    } while (pageItems.length >= batchAmount);
    
    return items;
  }
  
  parseTrackId(trackIdOrUri) {
    // Parse track uri: "spotify:track:4JpKVNYnVcJ8tuMKjAj50A"
    const idParts = trackIdOrUri.split(':');
    
    return idParts[idParts.length - 1];
  }
  
  parseUserId(trackIdOrUri) {
    // Parse track uri: "spotify:user:john-snow"
    const idParts = trackIdOrUri.split(':');
    
    return idParts[idParts.length - 1];
  }
  
  parsePlaylistId(playlistUri) {
    // Parse platlist uri: "spotify:user:thelinmichael:playlist:7d2D2S200NyUE5KYs80PwO"
    const idParts = playlistUri.split(':');
    
    return [idParts[2], idParts[4]];
  }
  
  async getUserProfile() {
    let user = await this.request('GET', 'v1/me');
    
    return {id: user.uri, name: user.display_name};
  }
  
  async getPlaylists() {
     let data = await this.requestPaginated('v1/me/playlists', 50);
    
    return data.map(i => {
      return {id: i.uri, name: i.name}
    });
  }
  
  async getPlaylist(uri) {
    const [userId, playlistId] = this.parsePlaylistId(uri);
    let playlist = await this.request('GET', `v1/users/${userId}/playlists/${playlistId}`);
    
    return {id: playlist.uri, name: playlist.name};
  }
  
  async getPlaybackState() {
    let player = await this.request('GET', 'v1/me/player');
    
    // If empty indicates no players
    if (!player) {
      return {
        hasActiveDevice: false,
        isPlaying: false,
        progressMs: null,
        durationMs: null,
        playlistId: null,
        currentTrack: {
          id: null,
          name: null,
          artistName: null,
        },
        repeatMode: null,
        shuffleMode: null,
        volumePercent: null,
      }
    }
    
    let playlistId;
    
    if (player.context && player.context.type === 'playlist') {
      playlistId = player.context.uri;
    }
    
    return {
      hasActiveDevice: true,
      isPlaying: player.is_playing,
      progressMs: player.progress_ms,
      durationMs: player.item ? player.item.duration_ms : null,
      currentTrack: {
        id: player.item ? player.item.uri : null,
        name: player.item ? player.item.name : null,
        artistName: player.item && player.item.artists[0] ? player.item.artists[0].name : null
      },
      playlistId,
      repeatMode: player.repeat_state,
      shuffleMode: player.shuffle_state,
      volumePercent: player.device ? player.device.volume_percent : null,
    };
  }
  
  async previousTrack() {
     return await this.request('POST', 'v1/me/player/previous');
  }
  
  async pauseMusic() {
     return await this.request('PUT', 'v1/me/player/pause');
  }
  
  async playMusic(playlistId, offsetTrackId = null) {
     return await this.request('PUT', 'v1/me/player/play', playlistId ? {
       context_uri: playlistId,
       offset: offsetTrackId ? {"uri": 'spotify:track:' + offsetTrackId} : undefined
     } : null);
  }
  
  async setVolume(percent) {
     return await this.request('PUT', 'v1/me/player/volume?volume_percent=' + encodeURIComponent(percent));
  }
  
  async setRepeatMode(mode) {
     return await this.request('PUT', 'v1/me/player/repeat?state=' + encodeURIComponent(mode), null);
  }
  
  async setShuffleMode(bool) {
     return await this.request('PUT', 'v1/me/player/shuffle?state=' + (bool ? 'true' : 'false'), null);
  }
  
  async nextTrack() {
     return await this.request('POST', 'v1/me/player/next', null);
  }
  
  async getTrackIdsFromPlaylist(playlistUri) {
    const [userId, playlistId] = this.parsePlaylistId(playlistUri);
    const uri = `v1/users/${userId}/playlists/${playlistId}/tracks`;
    
    let data = await this.requestPaginated(uri, 50);

    return data.map(i => this.parseTrackId(i.track.uri));
  }
  
  async getTrackEnergyRatings(trackIds) {
    let promises = [];
    let map = {};
    
    for(let i = 0; i < trackIds.length; i += 100) {
      const ids = trackIds.slice(i, i + 100).join(',');
      const uri = `v1/audio-features?ids=${ids}`;
      
      promises.push(
       this.request('GET', uri)
          .then(response => {
            for (let track of response.audio_features) {
              map[track.id] = track.energy;
            }
          })
      )
    }
    
    await Promise.all(promises);
    
    return map;
  }
  
  async createPlaylist(userId, name, description) {
    userId = this.parseUserId(userId);
    
    return await this.request('POST', `v1/users/${userId}/playlists`, {
      name,
      description,
      public: false,
    });
  }
  
  async clearPlaylist(playlistUri) {
    const [userId, playlistId] = this.parsePlaylistId(playlistUri);
    
    return await this.request('PUT', `v1/users/${userId}/playlists/${playlistId}/tracks`, {
      uris: []
    });
  }
  
  async addTrackToPlaylist(playlistUri, trackId) {
    const [userId, playlistId] = this.parsePlaylistId(playlistUri);
    
    return await this.request('POST', `v1/users/${userId}/playlists/${playlistId}/tracks`, {
      uris: ['spotify:track:' + trackId]
    });
  }
}

export default ApiClient;