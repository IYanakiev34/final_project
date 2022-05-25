import Navbar from "./Navbar";

// The layout comopnent for the whole application
export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
}
