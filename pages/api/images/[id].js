import { doc, getDoc } from "firebase/firestore";

import { db } from "../../../lib/firebase";

// Get image by id
export default async function handler(req, res) {
    // id of the image
    const id = req.query.id;

    if (req.method == "GET") {
        // Get refference to the document
        const docRef = doc(db, "pictures", id);
        const document = await getDoc(docRef);

        // if exists send document else no such document exists in the database
        if (document.exists()) {
            res.json({ data: document.data(), id: document.id });
        } else {
            res.status(404).json({ error: "Image not found" });
        }
    } else {
        res.status(400).json({ message: "Wrong method", status: 400 });
    }
}
