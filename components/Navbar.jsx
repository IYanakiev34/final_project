import Link from "next/link";
import { useRouter } from "next/router";

/**
 *
 * @returns Navigation bar located at the top of each page with link components in order to
 * route between pages
 */
export default function Navbar() {
    const router = useRouter();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-8xl mx-auto px-4">
                <div className="flex justify-between">
                    <div className="flex space-x-7">
                        <div className="hidden md:flex items-center space-x-1">
                            <Link href="/">
                                <a
                                    className={`py-4 px-2 ${
                                        router.pathname == "/"
                                            ? "text-blue-500 border-b-4 border-blue-500"
                                            : ""
                                    } text-gray-500 hover:text-blue-500 transition duration-300 font-semibold `}
                                >
                                    Home
                                </a>
                            </Link>
                            <Link href="/gallery">
                                <a
                                    className={`py-4 px-2 ${
                                        router.pathname == "/gallery"
                                            ? "text-blue-500 border-b-4 border-blue-500"
                                            : ""
                                    } text-gray-500 hover:text-blue-500 transition duration-300 font-semibold `}
                                >
                                    Gallery
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}