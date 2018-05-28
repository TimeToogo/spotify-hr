import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_SCOPES } from "../common/spotify.secret";

function mySettings(props) {
  const refreshToken = props.settingsStorage.getItem('spotify_refresh_token');
  const currentUserName = props.settingsStorage.getItem('spotify_current_user_name');
  const isLoggedIn = currentUserName && refreshToken;
  return (
    <Page>
      <Section
        title={<Text bold align="center">Spotify HR Settings</Text>}
        >
        {isLoggedIn &&
          <Text>
            Logged in as {currentUserName}
          </Text>}
        {!isLoggedIn &&
          <Oauth
            settingsKey="oauth-spotify"
            title="Spotify Login"
            label="Spotify"
            status={refreshToken ? 'Logged In' : 'Login'}
            authorizeUrl="https://accounts.spotify.com/authorize"
            requestTokenUrl="https://accounts.spotify.com/api/token"
            clientId={SPOTIFY_CLIENT_ID}
            clientSecret={SPOTIFY_CLIENT_SECRET}
            scope={SPOTIFY_SCOPES}
            onReturn={(data) => {
               console.log(`[Settings] Auth code received`)
               props.settingsStorage.setItem('spotify_current_user_name', '');
               props.settingsStorage.setItem('spotify_refresh_token', '');
               props.settingsStorage.setItem('spotify_oauth_code', data.code);
            }}
          />}
        {isLoggedIn &&
          <Button
            style={{color: 'red'}}
            label="Logout"
            onClick={() => props.settingsStorage.setItem('spotify_refresh_token', '')}
          />}
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
