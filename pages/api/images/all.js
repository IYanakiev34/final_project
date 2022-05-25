import { collection, getDocs } from "firebase/firestore";
import { db, postToJSON } from "../../../lib/firebase";

// Get all images from the database
export default async function handler(req, res) {
    if (req.method == "GET") {
        // Get the collection with the images
        const images = await getDocs(collection(db, "pictures"));
        // Get the JSON data from the images
        const imageData = images.docs.map((d) => postToJSON(d));

        // If there are images send them else throw error no images in the database
        if (imageData.length > 0) {
            res.status(200).json(imageData);
        } else {
            res.status(404).json({ error: "No images found in the databse" });
        }
    } else {
        res.status(400).json({
            message: "Wrong method, ALLOW GET",
            status: 400,
        });
    }
}
