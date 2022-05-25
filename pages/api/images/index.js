import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// Get all images in the database by tags
export default async function handler(req, res) {
    // Get tags array
    var tags = req.query.tag;

    if (req.method == "GET") {
        // Query all documents with tags
        const q = query(
            collection(db, "pictures"),
            where("tags", "array-contains-any", tags)
        );

        // Get the documents
        const documents = await getDocs(q);

        // Send the pictures
        var relevantPictures = [];
        if (documents.docs.length > 0) {
            documents.forEach((d) => {
                if (d.data()) {
                    const pic = { data: d.data(), id: d.id };
                    relevantPictures.push(pic);
                }
            });
            res.json(relevantPictures);
        } else {
            res.status(404).json({ error: "No images with these tags" });
        }
    } else {
        res.status(400).json({ message: "Wrong method", status: 400 });
    }
}
