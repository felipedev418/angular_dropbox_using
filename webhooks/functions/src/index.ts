import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';

// Initalizing Firebase and Firestore
firebaseAdmin.initializeApp(functions.config().firebase);

export const defaultHeaders = {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export const dbxwebhooks = functions.https.onRequest((request, response) => {
    switch (request.method) {
        case 'GET':
            const queryString = request.query.challenge;
            const responseHeaders = {
                'Content-Type': 'text/plain',
                'X-Content-Type-Options': 'nosniff'
            };

            response.status(200)
                    .set(responseHeaders)
                    .send(queryString);
            break;
        case 'POST':
            const newKey = firebaseAdmin.database().ref('dbxwebhooks').push().key;
            firebaseAdmin.database()
                .ref('dbxwebhooks/' + newKey)
                .set({
                    ...request.body,
                    timestamp: Date.now()
                }, (error) => {
                        if (error) {
                            response.status(400)
                                    .set(defaultHeaders)
                                    .send(error);
                        } else {
                            response.status(200)
                                    .set(defaultHeaders)
                                    .send('Process successfully');
                        }
                    }
                );
            break;
        default:
            response.status(400)
                    .set(defaultHeaders)
                    .send('Bad Request');
            break;
    }
});
