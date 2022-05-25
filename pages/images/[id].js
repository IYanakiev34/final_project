import { db, postToJSON } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";

// Page to get the specific image with ID and display it along with it's tags
export default function GetSpecificImage(props) {
    // Get if image exists
    const isData = props.exists;

    const [isShown, setIsShown] = useState(false);

    var data;
    var tagsAndConfidence;
    // If exists fix the height and width of the image
    if (isData) {
        data = props.data;
        tagsAndConfidence = props.tagsConfidence;
    }

    return (
        <div>
            {isData ? (
                <div className="h-max grid grid-cols-2 gap-x-6 content-center">
                    <img
                        src={data.download}
                        className="object-scale-down"
                    ></img>
                    <div className="grid grid-rows-auto gap-y-6">
                        {tagsAndConfidence.map((el) => (
                            <div
                                key={el.tag}
                                className="font-mono text-2xl font-light text-left ml-10 rounded border border-sky-500"
                                onMouseEnter={() => {
                                    setIsShown(true);
                                }}
                                onMouseLeave={() => {
                                    setIsShown(false);
                                }}
                            >
                                tag: <span> {el.tag} </span>{" "}
                                {isShown && <span> {el.confidence} </span>}
                            </div>
                        ))}
                        <div className="font-mono text-2xl font-light text-left ml-10  rounded border border-sky-500">
                            Analyzed at:
                            {new Date(data.createdAt).toLocaleString("en-GB")}
                        </div>
                    </div>
                </div>
            ) : (
                <div>No Image with this ID</div>
            )}
        </div>
    );
}

// Get the picture from the database and pass it to the component as props
// Done on server side
export async function getServerSideProps(context) {
    const pid = context.params.id;
    const docRef = doc(db, "pictures", pid);
    const document = await getDoc(docRef);

    var tagsAndConfidence = [];

    if (document.exists()) {
        const data = postToJSON(document);

        for (var i = 0; i < data.tags.length; i++) {
            var tagsConfidence = {
                tag: data.tags[i],
                confidence: data.confidence[i],
            };
            tagsAndConfidence.push(tagsConfidence);
        }
        return {
            props: {
                data: data,
                exists: true,
                tagsConfidence: tagsAndConfidence,
            },
        };
    } else {
        return {
            props: {
                exists: false,
            },
        };
    }
}
