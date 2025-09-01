import { useState, useEffect } from "react";
// import { AuthContext } from "../context/AuthContext";
import NavbarType from "../types/components/NavbarType";
import { useNavigate } from "react-router";
import profileIcon from "../assets/profile_icon.svg"
// import { decodeJWT } from "../utils/Helper";

const Navbar = (props: NavbarType) => {
    const navigate = useNavigate();

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [showProfileIcon, setShowProfileIcon] = useState(true);
    const [userName, setUserName] = useState("User");

    const hideProfileForPages = ["Login", "Register", "Forgot", "Reset"];
    const hidePages = ["None", "Login", "Register", "Forgot", "Reset"];
    const shouldHideProfile = hideProfileForPages.includes(props.currentPage);
    const shouldHidePages = hidePages.includes(props.currentPage);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const storedName = localStorage.getItem("name");
            if (storedName) {
                setUserName(storedName);
            }
        }
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
        setShowProfileIcon((prev) => !prev);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId")
        navigate("/login");
    };

    const links = [
        {
            text: "ALL TOOLS",
            isActive: props.currentPage == "All Tools",
            link: "/tools",
        },
        {
            text: "DASHBOARD",
            isActive: props.currentPage == "Dashboard",
            link: "/dashboard",
        },
    ];

    return (
        <header className="w-full bg-color_secondary shadow-md flex items-center fixed top-[8px] left-[20px] z-50 m-[-8px] ml-[-20px] pl-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.25)]">
            <div className="font-bold m-[4px]">
                <span className="text-[36px] drop-shadow-[0_2px_1px_rgba(0,0,0,0.4)]">T</span>
                <span className="text-[24px] drop-shadow-[0_2px_1px_rgba(0,0,0,0.4)]">RANSCRIPT</span>
                <span className="text-[36px] drop-shadow-[0_2px_1px_rgba(0,0,0,0.4)]">X</span>
            </div>

			<nav>
                {!shouldHidePages && (
                    <ul className="flex flex-row space-x-6 list-none items-center">

                        {links.map((item, index) => {
                            return (
                                <li key={index} className="mx-[12px]">
                                    <a className={`mx-4 cursor-pointer ${
                                            item.isActive
                                                ? "text-black underline decoration-black"
                                                : "text-black hover:underline hover:decoration-black hover:text-black"
                                        }`} 
                                        onClick={(e) => { 
                                        e.preventDefault(); 
                                        navigate(item.link);
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>     
                )}
				
			</nav>

            {props.currentPage != "None" && !shouldHideProfile && !shouldHidePages && (
            <div className="ml-auto flex items-center h-full ">
                    <button onClick={toggleDropdown} className="border-none bg-color_secondary cursor-pointer items-center pr-[10px]" disabled={!showProfileIcon}>
                        {showProfileIcon && (
                            <img src={profileIcon} alt="profile" className= "size-[56px]" />    
                        )}
                    </button>

                    {isDropdownOpen && (
                    <div className="flex items-up justify-end bg-grey p-[8px] pt-[4px] pb-[2px] space-x-[8px]">
                        <div>
                            <img src={profileIcon} className="size-[51px]" />  
                        </div>
                        <div className="flex-row">
                            <div className="font-bold text-[16px] ml-[8px]">{userName}</div>
                            <a href="/profile" className="text-black no-underline hover:underline hover:text-biru mt-[10px] space-x-[4px] text-[10px] mr-[4px]"></a>
                            {/* <span>|</span> */}
                            <button onClick={logout} className="text-biru text-sm hover:underline border-none bg-grey cursor-pointer no-underline text-[10px] ">  
                                Logout
                            </button>    
                        </div>
                        <div>
                            <button onClick={toggleDropdown} className="border-none bg-grey cursor-pointer p-[0px] pl-[4px] pr-[4px]" >
                                X
                            </button>     
                        </div>
                    
                    </div>
                )}
            </div>
            )}
        </header>
    );
};

export default Navbar;
