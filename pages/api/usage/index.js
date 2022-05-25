import { db, postToJSON } from "../../../lib/firebase";

// Get the usage for the APIs used
export default async function handler(req, res) {
    if (req.method == "GET") {
        // Get the collection reference for the usage data
        const usageRef = collection(db, "usage");

        // Get the documents
        const usage = await getDocs(usageRef);

        // Get the JSON objetcs of the documents
        const usageData = usage.docs.mac((us) => postToJSON(us));

        // If usage data  is > 0 send it else throw error
        if (usageData.length > 0) {
            res.status(200).json(usageData);
        } else {
            res.status(404).json({ message: "No usage data found" });
        }
    } else {
        res.status(400).json({ error: "Bad request", message: "ALLOW GET" });
    }
}
