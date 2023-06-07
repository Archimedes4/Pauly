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

const runtimeOpts = {
  timeoutSeconds: 400,
};

export const addMicrosoftUser = onCall(runtimeOpts, async (request) => {
  // Data
  // userName: string (email)
  // displayName: string
  // externalId
  try {
    const result = {
      SuccessfulCreations: 0,
      UnsuccessfulCreations: 0,
      NewAccounts: 0,
      AlreadyMade: 0,
    };
    for (let index = 0; index < request.data.Body.length; index++) {
      try {
        await admin.auth()
          .getUserByEmail(request.data.Body[index]["userName"]);
        result.AlreadyMade += 1;
      } catch (_e) {
        const err:Error= _e as Error;
        if (err.message === "auth/user-not-found") {
          result.NewAccounts += 1;
          try {
            const user: UserRecord = await admin.auth()
              .createUser(
                {
                  email: request.data.Body[index]["userName"],
                }
              );
            await admin.auth().updateUser(user.uid, {
              displayName: request.data.Body[index]["displayName"],
              emailVerified: true,
              disabled: true,
              providerToLink: {
                displayName: request.data.Body[index]["displayName"],
                email: request.data.Body[index]["userName"],
                providerId: "microsoft.com",
                uid: request.data.Body[index]["externalId"],
                // e.g. 8066569b-7203-4894-8552-4be01e28d2a2
              },
            });
            result.SuccessfulCreations += 1;
          } catch {
            result.UnsuccessfulCreations += 1;
          }
        } else {
          result.UnsuccessfulCreations += 1;
        }
      }
    }
    return {
      // Result: "Success" + updatedUser.providerData[0],
      Result: result,
    };
  } catch (error) {
    return {
      Result: "Error" + error + request.data.Body,
    };
  }
});

export const deleteAnonymousUsers = onCall(async (request) => {
  let user: string[] = [];
  /**
  * @param {string} nextPageToken
  */
  function listAllUsers(nextPageToken?: string) {
    // List batch of users, 1000 at a time.
    admin.auth().listUsers(1000, nextPageToken)
      .then(function(listUsersResult) {
        listUsersResult.users.forEach(function(userRecord) {
          console.log("user", userRecord.toJSON());
          if (userRecord?.providerData.length === 0) {
            user.push(userRecord.uid);
          }
        });
        admin.auth().deleteUsers(user);
        user = [];
        if (listUsersResult.pageToken) {
          // List next batch of users.
          listAllUsers(listUsersResult.pageToken);
        }
      })
      .catch(function(error) {
        console.log("Error listing users:", error);
      });
  }
  // Start listing users from the beginning, 1000 at a time.
  listAllUsers();
});
