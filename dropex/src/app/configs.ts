// Configurations
export const dropboxConfig = {
    clientId: '<YOUR_CLIENT_ID>',
    redirectUri: '<YOUR_REDIRECTURI>/auth:now',
    responseType: 'token',
    trustUrl: 'https://www.dropbox.com'
};

export const dropboxApi = {
    'filesListFolderContinue': 'https://api.dropboxapi.com/2/files/list_folder/continue',
    'filesListFolderGetLatestCursor': 'https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor'
};

export const firebaseConfig = {
    production: false,
    firebase: {
        apiKey: '<YOUR_API_KEY>',
        authDomain: '<YOUR_AUTH_DOMAIN>',
        databaseURL: '<YOUR_DATABASE_URL>',
        projectId: '<YOUR_PROJECT_ID>',
        storageBucket: '<YOUR_STORAGE_BUCKET>',
        messagingSenderId: '<YOUR_MESSAGING_SENDER_ID>'
    },
    listPath: '/dbxwebhooks',
    orderBy: 'list_folder/accounts/0'
};

// Constants
export interface DbxAuth {
    accessToken?: string;
    tokenType?: string;
    uid?: string;
    accountId?: string;
    isAuth?: boolean;
}
