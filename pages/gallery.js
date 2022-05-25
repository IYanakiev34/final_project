import { postToJSON, db } from "../lib/firebase";
import { useRouter } from "next/router";
import { collection, getDocs } from "firebase/firestore";
import { useState } from "react";
import axios from "axios";

export default function Gallery(props) {
    const [tags, setTags] = useState("");
    const router = useRouter();
    const [imageData, setImageData] = useState(props.data);

    const goToImage = (id) => {
        router.push("http://localhost:3000/images/" + id);
    };

    const getByTags = async () => {
        const tagsToSearch = tags.split(" ");
        console.log(tagsToSearch);
        var url = "http://localhost:3000/api/images?";
        for (var i = 0; i < tagsToSearch.length; i++) {
            if (i == tagsToSearch.length - 1) {
                url += "tag=" + tagsToSearch[i];
            } else {
                url += "tag=" + tagsToSearch[i] + "&";
            }
        }

        // Make sure it's an array since we need array for the request
        if (tagsToSearch.length == 1) {
            url += "&tag=" + tagsToSearch[0];
        }

        // Get the pictures
        var picturesWithTags;
        await axios
            .get(url)
            .then(function (response) {
                picturesWithTags = response.data;
            })
            .catch(function (error) {
                picturesWithTags = error.response.status;
            });

        if (picturesWithTags == 404) {
            alert("No Images with these tags");
            setImageData([]);
            return;
        }

        console.log(picturesWithTags);
        // Get the data from the response
        var dataForPics = [];
        for (var i = 0; i < picturesWithTags.length; i++) {
            dataForPics.push(picturesWithTags[i].data);
        }
        setImageData(dataForPics);
    };
    return (
        <>
            <div className="flex justify-center">
                <div className="mb-3 xl:w-96">
                    <div className="input-group relative flex flex-wrap items-stretch w-full mb-4">
                        <input
                            type="search"
                            class="form-control relative flex-auto min-w-0 block px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                            placeholder="Search"
                            aria-label="Search"
                            aria-describedby="button-addon3"
                            onChange={(e) => {
                                setTags(e.target.value);
                            }}
                        />
                        <button
                            className="btn inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                            type="button"
                            id="button-addon3"
                            onClick={() => getByTags()}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 grid-rows-auto gap-2">
                {imageData.map((image) => (
                    <img
                        src={image.download}
                        alt="Pic"
                        className="object-scale-down"
                        onClick={() => goToImage(image.id)}
                    ></img>
                ))}
            </div>
        </>
    );
}

// Get all the images from the db and pass them to the component as props
export async function getServerSideProps() {
    const images = await getDocs(collection(db, "pictures"));
    const imageData = images.docs.map((d) => postToJSON(d));
    return {
        props: { data: imageData },
    };
}
