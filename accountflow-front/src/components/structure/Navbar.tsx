import Image from "next/image";
import Logo from "@/assets/images/logos/logoTransparente4.png"


export default function Navbar() {
    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center">
                    <a href="/" className="flex items-center">
                        <Image src={Logo} alt="Logo" width={40} height={40} className="mr-4" />
                        <span className="text-xl font-semibold dark:text-white">AccountFlow</span>
                    </a>
                </div>
                <div className="flex items-center border-1 rounded-full">
                    <Image src={Logo} alt="userInfo" width={40} height={40} className="rounded-full" />
                </div>
            </div>
        </nav>
    )
}