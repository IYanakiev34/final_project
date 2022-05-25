import got from "got";
import axios from "axios";
import rateLimit from "../../utils/rate-limit";
const probe = require("probe-image-size");

import {
    doc,
    addDoc,
    collection,
    serverTimestamp,
    getDocs,
    query,
    where,
    updateDoc,
    increment,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
});

/**
 * Increment the usage of the Imagga API by one
 */
const incrementUsage = async () => {
    const imaggaIdDoc = "9HC6eGwgjMTglAnRsQwS";
    const refDoc = doc(db, "usage", imaggaIdDoc);
    await updateDoc(refDoc, {
        usage: increment(1),
    });
};

/**
 * Get the tags and the confidence into different arrays to pass to the databse
 * @param {The response body of the ISC} data
 * @returns { confidence, tags} arrays
 */
const getTags = (data) => {
    var myTags = [];
    var confidence = [];
    var i = 0;
    while (data[i].confidence >= 70) {
        myTags.push(data[i].tag.en);
        confidence.push(data[i].confidence);
        i++;
    }

    return { myTags, confidence };
};

/**
 * Convert the image into array buffer and encode in base64
 * @param {The image url of the picture being analyzed} imageUrl
 * @returns buffer encode in base 64
 */
const getBufferFromImage = async (imageUrl) => {
    var buffer;
    const image = await axios
        .get(imageUrl, { responseType: "arraybuffer" })
        .then((response) => {
            buffer = Buffer.from(response.data).toString("base64");
        });
    return buffer;
};

/**
 * Method to return the image size of a valid url
 * @param {The url of the image} imageUrl
 * @returns
 */
const getImageSize = async (imageUrl) => {
    let result = await probe(imageUrl, {
        rejectUnauthorized: false,
    });

    return result;
};

export default async function handler(req, res) {
    if (req.method == "POST") {
        var sent = false;
        // Get body from query
        const username = req.body.username;
        const password = req.body.password;
        const cached = req.body.cached;

        // Prepare image url
        const imageUrl = req.body.url;

        var sentFromCache = false;

        const url =
            "https://api.imagga.com/v2/tags?image_url=" +
            encodeURIComponent(imageUrl);

        if (cached == "true") {
            // Collection refference
            const picturesRef = collection(db, "pictures");

            //Query for the document
            const q = query(picturesRef, where("url", "==", imageUrl));

            // Get the data
            const document = await getDocs(q);

            // If exists send it
            if (document.docs.length > 0) {
                document.forEach((d) => {
                    if (d.data()) {
                        const data = d.data();
                        res.json({ tags: data.tags, id: d.id });
                        sentFromCache = true;
                    }
                });
            }
        }
        if (!sentFromCache) {
            try {
                // Throtliing of the request
                await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per minute
                try {
                    // anayze image
                    const response = await got(url, {
                        username: username,
                        password: password,
                    });

                    // Get the JSON data
                    const result = JSON.parse(response.body);

                    //Get tags from data
                    const data = result.result.tags;

                    const resultTags = getTags(data);
                    const myTags = resultTags.myTags;
                    const confidence = resultTags.confidence;

                    // Get the base64 array buffer from image url
                    var buffer = await getBufferFromImage(imageUrl);

                    // store the buffer in the cloud storage
                    const storageRef = ref(
                        storage,
                        "image/" + Math.floor(Math.random() * (10000 - 0) + 0)
                    );

                    // Get Image size
                    const imageSize = await getImageSize(imageUrl);
                    const width = imageSize.width;
                    const height = imageSize.height;

                    await uploadString(storageRef, buffer, "base64");

                    // get dodnload link
                    const link = await getDownloadURL(storageRef);

                    // add the document to the cloud database
                    await addDoc(collection(db, "pictures"), {
                        url: imageUrl,
                        download: link,
                        tags: myTags,
                        confidence: confidence,
                        createdAt: serverTimestamp(),
                        width: width,
                        height: height,
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

                    await incrementUsage();

                    // Send the data of the document with its ID for redirecting
                    res.status(200).json({
                        tags: data,
                        id: docId,
                    });
                } catch (error) {
                    // Error from analyzer => probably wrong URL
                    res.status(400).json({
                        error: error,
                        message: "Error, entered a wrong URL",
                    });
                }
            } catch {
                // Throtlling error exceeded requests
                res.status(429).json({ error: "Rate limit exceeded" });
            }
        }
    } else {
        // Method error
        res.status(400).json({ message: "ALLOW POST", status: 400 });
    }
}
