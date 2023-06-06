/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {UserRecord} from "firebase-admin/auth";
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const addMicrosoftUser = onCall(async (request) => {
  // Data
  // userName: string (email)
  // displayName: string
  // externalId
  try {
    const user:UserRecord = await admin.auth()
      .createUser(
        {
          email: request.data.userName,
        }
      );

    const updatedUser = await admin.auth().updateUser(user.uid, {
      displayName: request.data.displayName,
      emailVerified: true,
      disabled: true,
      providerToLink: {
        displayName: request.data.displayName,
        email: request.data.userName,
        providerId: "microsoft.com",
        uid: request.data.externalId,
        // e.g. 8066569b-7203-4894-8552-4be01e28d2a2
      },
    });
    return {
      Result: "Success" + updatedUser.providerData[0],
    };
  } catch {
    return {
      Result: "Error",
    };
  }
});
