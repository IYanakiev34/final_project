import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// Make them into env variables
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

// Get the tags of the image sent
const getTags = async (url, cache) => {
    try {
        // Results
        var res;

        // Send request to the backend which sends request to the analyzer
        // result is either the tags or an error
        await axios
            .post(
                "api/analyze",
                {
                    username: apiKey,
                    password: apiSecret,
                    url: url,
                    cached: cache,
                },
                { headers: { "Access-Control-Allow-Origen": "*" } }
            )
            .then(async function (response) {
                res = response.data;
            })
            .catch(function (error) {
                res = error.response.status;
            });
        return res;
    } catch (error) {
        console.log(error);
    }
};

export default function Home() {
    const [url, setUrl] = useState("");

    const router = useRouter();

    const sendImageForTag = async (cached) => {
        const result = await getTags(url, cached);

        // If error alert the user else get the tags and redirect
        if (result == 400) {
            alert("Wrong URL");
        } else if (result == 429) {
            alert("Too many requests");
        } else {
            // Redirect
            router.push(
                "https://final-project-iyanakiev34.vercel.app/images/" +
                    result.id
            );
        }
    };

    return (
        <div className="h-screen grid grid-cols-1 gap-4 content-center justify-items-center gap-y-3">
            <div className="py-2 px-3 font-mono text-2xl font-semibold text-black">
                Enter an image URL which you want to tag
            </div>
            <input
                name="url"
                type="text"
                className="block w-10/12 shadow py-3 px-4 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md focus:outline-none focus:ring-2"
                placeholder="Image URL"
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                }}
            ></input>
            <button
                type="button"
                className="w-10/12 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center mx-4"
                onClick={() => {
                    sendImageForTag("false");
                }}
            >
                Submit
            </button>
            <button
                type="button"
                className="w-10/12 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center mx-4"
                onClick={() => {
                    sendImageForTag("true");
                }}
            >
                Cached
            </button>
        </div>
    );
}
