import Im from "next/image";
import { db, postToJSON } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function GetSpecificImage(props) {
    // Get props
    const isData = props.exists;
    var data;
    if (isData) {
        data = props.data;
        // Get image width heigth
        var image = new Image();
        image.src = data.download;
        const maxWidth = 600;
        const maxHeight = 600;

        const ratio = image.width / image.height;

        // Fix by ratio
        if (image.width > maxWidth) {
            image.width = maxWidth;
            image.height = maxWidth / ratio;
            console.log("here");
        } else if (image.height > maxHeight) {
            image.height = maxHeight;
            image.width = maxHeight * ratio;
        }
    }

    return (
        <div>
            {isData ? (
                <div className="h-max grid grid-cols-2 gap-x-6 content-center">
                    <Im
                        src={data.download}
                        layout="responsive"
                        width={image.width}
                        height={image.height}
                    ></Im>
                    <div className="grid grid-rows-auto gap-y-6">
                        {data.tags.map((tag) => (
                            <div
                                key={tag}
                                className="font-mono text-2xl font-light text-left ml-10"
                            >
                                tag: <span> {tag} </span>
                            </div>
                        ))}
                        <div className="font-mono text-2xl font-light text-left ml-10">
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
export async function getServerSideProps(context) {
    const pid = context.params.id;
    const docRef = doc(db, "pictures", pid);
    const document = await getDoc(docRef);

    if (document.exists()) {
        const data = postToJSON(document);
        return {
            props: {
                data: data,
                exists: true,
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
