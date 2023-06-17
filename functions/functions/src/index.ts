
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
*/

import {HttpsError, onCall} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {UserRecord} from "firebase-admin/auth";
admin.initializeApp();

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
      Errors: [] as any[],
    };
    for (let index = 0; index < request.data.Body.length; index++) {
      try {
        await admin.auth()
          .getUserByEmail(request.data.Body[index]["userName"]);
        result.AlreadyMade += 1;
      } catch (_e) {
        const err:Error= _e as Error;
        if (err.message ===
          "There is no user record corresponding to the provided identifier.") {
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
          } catch (error: any) {
            result.UnsuccessfulCreations += 1;
            result.Errors.push("Error Here", error);
          }
        } else {
          result.UnsuccessfulCreations += 1;
          result.Errors.push("Error There", err.message, err);
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

export const addUserDataMicrosoft = onCall(async (request) => {
  const db = admin.firestore();

  let nonApplicable = 0;
  let failures = 0;
  let created = 0;
  let updateted = 0;
  let ErrorVal = "";
  for (let index = 0; index < request.data.Body.length; index++) {
    try {
      const user = await admin.auth()
        .getUserByEmail(request.data.Body[index]["userName"]);
      const docRef = db.collection("Users").doc(user.uid);
      docRef.get().then(function(doc) {
        if (doc.exists == false) {
          let microsoftUid = "";
          for (let index = 0; index<user.providerData.length; index++) {
            if (user.providerData[index].providerId ===
              "microsoft.com") {
              microsoftUid = user.providerData[index].uid;
            }
          }
          if (microsoftUid !== "" &&
          request.data.Body[index]["givenName"] !== null &&
          request.data.Body[index]["surname"] !== null) {
            docRef.set(
              {
                "ClassMode": null,
                "ClassPerms": null,
                "Classes": [],
                "CompletedCommissions": [],
                "ElectionsVoted": [],
                "Email": user.email,
                "First Name": request.data.Body[index]["givenName"],
                "Grade": request.data.Body[index]["Grade"],
                "Groups": [],
                "Last Name": request.data.Body[index]["surname"],
                "MemberGroups": [],
                "NotificationToken": "",
                "Permissions": [],
                "Score": 0,
                "Section": null,
                "SportsPerms": null,
                "SportsMode": null,
                "SubmittedCommissions": null,
                "Title": request.data.Body[index]["Title"],
                "uid": user.uid,
                "MicrosoftID": microsoftUid,
              }
            );
            created++;
          } else {
            nonApplicable++;
          }
        } else {
          let microsoftUid = "";
          for (let index = 0; index<user.providerData.length; index++) {
            if (user.providerData[index].providerId ===
              "microsoft.com") {
              microsoftUid = user.providerData[index].uid;
            }
          }
          if (microsoftUid !== "" &&
          request.data.Body[index]["givenName"] !== null &&
          request.data.Body[index]["surname"] !== null) {
            docRef.set(
              {
                "Email": user.email,
                "Grade": request.data.Body[index]["Grade"],
                "Title": request.data.Body[index]["Title"],
                "uid": user.uid,
                "MicrosoftID": microsoftUid,
              }, {merge: true}
            );
            updateted++;
          } else {
            nonApplicable++;
          }
        }
      }).catch(function(error) {
        failures++;
        ErrorVal += error;
      });
    } catch (error) {
      failures++;
      ErrorVal += error;
    }
  }
  return {
    "Result": {
      "Failures": failures,
      "nonApplicable": nonApplicable,
      "Created": created,
      "Updated": updateted,
      "Error": ErrorVal,
    },
  };
});

export const helloWorld = onCall(async (request) => {
  if (request.data === undefined) {
    throw new HttpsError(
      "invalid-argument",
      "Parameter 'variable' must be a string"
    );
  }
  return {
    "Hello": "World",
  };
});

