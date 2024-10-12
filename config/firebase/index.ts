import { initializeApp, applicationDefault } from "firebase-admin/app";

export const initFirebase = () => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS;
  initializeApp({
    credential: applicationDefault(),
    projectId: "taskify-29c1e",
  });
};
