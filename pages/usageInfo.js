import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Usage(props) {
    const data = props.data;

    return (
        <div>
            <h1>{data.service}</h1>
            <h1>{data.usage}</h1>
            <h1>{data.limit}</h1>
        </div>
    );
}

// Get all the images from the db and pass them to the component as props
export async function getServerSideProps() {
    const imaggaIdDoc = "9HC6eGwgjMTglAnRsQwS";
    const refDoc = doc(db, "usage", imaggaIdDoc);

    const dataOfUsage = await getDoc(refDoc);

    return {
        props: {
            data: dataOfUsage.data(),
        },
    };
}
