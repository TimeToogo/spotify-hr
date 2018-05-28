import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_SCOPES } from "../common/spotify.secret";
import { btoa } from "../common/base64-polyfill";
import { urlEncode } from "../common/url-encode";

export const getSpotifyApiToken = async function (exchangeCode, grantType = "authorization_code") {

    const tokenRequest = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: urlEncode({
            grant_type: grantType,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET,
            scope: SPOTIFY_SCOPES,
            code: grantType === "authorization_code" ? exchangeCode : null,
            refresh_token: grantType === "refresh_token" ? exchangeCode : null,
            redirect_uri:'https://app-settings.fitbitdevelopercontent.com/simple-redirect.html',
        })
    };
  
    return await fetch('https://accounts.spotify.com/api/token', tokenRequest)
        .then(function(data){
            return data.json();
        }).catch(function(err) {
            console.log('Error on token generation '+ err);
        })
}