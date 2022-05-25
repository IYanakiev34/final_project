import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCv4K6OYZANtiV7j8NGz4dneX7kFymEeiQ",
    authDomain: "finaltask-cd96d.firebaseapp.com",
    projectId: "finaltask-cd96d",
    storageBucket: "finaltask-cd96d.appspot.com",
    messagingSenderId: "718584491302",
    appId: "1:718584491302:web:6ca77df6990287d186e5e7",
    measurementId: "G-TZYZRYR4E8",
};

// Initialize Firebase and export authentication,db, and storage
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Function to transform the Firebase data to JSON objects
export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        id: doc.id,
    };
}
