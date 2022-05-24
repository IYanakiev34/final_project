import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// Get image by id
export default async function handler(req, res) {
    var tags = req.query.tag;

    console.log(tags);

    if (req.method == "GET") {
        const q = query(
            collection(db, "pictures"),
            where("tags", "array-contains-any", tags)
        );
        const documents = await getDocs(q);

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
