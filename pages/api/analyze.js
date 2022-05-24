import got from "got";
import axios from "axios";
import rateLimit from "../../utils/rate-limit";

import {
    addDoc,
    collection,
    serverTimestamp,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(req, res) {
    if (req.method == "POST") {
        // Get body from query
        const username = req.body.username;
        const password = req.body.password;
        const cached = req.body.cached;

        // Prepare image url
        const imageUrl = req.body.url;

        const url =
            "https://api.imagga.com/v2/tags?image_url=" +
            encodeURIComponent(imageUrl);

        var sentFromCache = false;

        // Check if cache  = false
        // If false send request
        // If true check if url is in db if in db send cache if not request
        if (cached == "true") {
            // update image with the link
            const picturesRef = collection(db, "pictures");
            const q = query(picturesRef, where("url", "==", imageUrl));
            const document = await getDocs(q);
            if (document.docs.length > 0) {
                document.forEach((d) => {
                    console.log(d.data());
                    if (d.data()) {
                        const data = d.data();
                        res.json({ tags: data.tags, id: d.id });
                        sentFromCache = true;
                    }
                });
            }
        } else {
            try {
                // Throtliing of the request
                await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per minute
                try {
                    console.log("Sending request");
                    // anayze image
                    const response = await got(url, {
                        username: username,
                        password: password,
                    });
                    const result = JSON.parse(response.body);

                    //get tags
                    const data = result.result.tags;
                    var myTags = [];
                    var confidence = [];
                    var i = 0;
                    while (data[i].confidence >= 70) {
                        myTags.push(data[i].tag.en);
                        confidence.push(data[i].confidence);
                        i++;
                    }

                    // fetch image from the url provided
                    var buffer;
                    const image = await axios
                        .get(imageUrl, { responseType: "arraybuffer" })
                        .then((response) => {
                            buffer = Buffer.from(response.data).toString(
                                "base64"
                            );
                        });

                    // store the blob in the firebase storage
                    const storageRef = ref(
                        storage,
                        "image/" + Math.floor(Math.random() * (10000 - 0) + 0)
                    );
                    await uploadString(storageRef, buffer, "base64");

                    // get dodnload link
                    const link = await getDownloadURL(storageRef);

                    // add doc
                    await addDoc(collection(db, "pictures"), {
                        url: imageUrl,
                        download: link,
                        tags: myTags,
                        confidence: confidence,
                        createdAt: serverTimestamp(),
                    });

                    // get document ID
                    const q = query(
                        collection(db, "pictures"),
                        where("url", "==", imageUrl)
                    );
                    const docs = await getDocs(q);

                    var docId;
                    docs.forEach((d) => {
                        // get the document ID
                        if (d.data()) {
                            docId = d.id;
                        }
                    });

                    res.status(200).json({
                        tags: data,
                        id: docId,
                    });
                } catch (error) {
                    res.status(400).json({
                        error: error,
                        message: "Error, entered a wrong URL",
                    });
                }
            } catch {
                res.status(429).json({ error: "Rate limit exceeded" });
            }
        }
    } else {
        res.status(400).json({ message: "Probably wrong method", status: 400 });
    }
}
