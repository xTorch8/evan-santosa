import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import defaultImage from "../../assets/default_pfp.png";
import Navbar from "../../components/Navbar";
import EmailLogo from "../../assets/EmailLogo.png";
import PhoneLogo from "../../assets/PhoneLogo.png";
import WebsiteLogo from "../../assets/WebsiteLogo.png";
import AddressLogo from "../../assets/AddressLogo.png";

const ProfilePage = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
      };

    useEffect(() => {
        const fetchProfileData = async () => {
        if (!authContext || !authContext.user?.companyId || !authContext.token) {
            console.error("Invalid auth context");
            navigate("../login");
            return;
        }

        try {
            const response = await axios.get(
            `https://api.hydrosense.nextora.my.id/dashboard/companies/${authContext.user.companyId}`,
            {
                headers: { Authorization: `Bearer ${authContext.token}` },
            }
            );
            setProfileData(response.data);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setIsLoading(false);
        }
        };

        fetchProfileData();
    }, [authContext, navigate]);

    if (isLoading) {
        return (
        <>
            <Navbar currentPage="Profile" />
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg animate-pulse">Loading profile...</p>
            </div>
        </>
        );
    }

    if (!profileData) {
        return (
        <>
            <Navbar currentPage="Profile" />
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-red-500">Failed to load profile data.</p>
            </div>
        </>
        );
    }

  return (
    <>
    <div className="bg-white h-svh">
      <Navbar currentPage="Profile" />
      <div>
        {/*Bagian header abu-abu*/}
        <div className="flex h-32">
            <div className="w-full bg-gray-300 h-56"></div>
        </div>

        <div className="absolute flex flex-row">
            {/*Company pfp*/}
            <div className="20 ml-10 mr-10">
            <img
                src={profileData.image || defaultImage}
                alt={profileData.name}
                className="w-48 h-48 rounded-full border-4 border-darkblue shadow-md"
            />
            </div>
            
            {/*Nama company dan description*/}
            <div className="text-center mt-28">
            <h1 className="text-4xl font-bold">{profileData.name}</h1>
            <p className="text-gray-600 mt-2 px-4">{profileData.description}</p>
            </div>

            {/*Logout button*/}  
            <button
            onClick={handleLogout}
            className="bg-red-500 text-white rounded hover:bg-red-600 transition ml-6 w-24 h-10 mt-28 "
            >
            Log Out
            </button>
        </div>
        

        {/*Bagian contact us company*/}
        <div className="mt-60 px-8 mb-40">
          <div className="bg-darkblue text-white px-4 py-2 rounded-t-lg flex justify-between items-center cursor-pointer" 
                onClick={() => setDropdownOpen(!dropdownOpen)}>
            <h2 className="text-2xl font-semibold">CONTACT US</h2>
            <button className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}>
				▼
			</button>
          </div>

          {/*Dropdown*/}
          {dropdownOpen && (
            <div className="bg-biru2 text-gray-700 px-6 py-4 rounded-b-lg mb-40">
              <ul className="space-y-3">
                <li className="flex items-center">
                    <img className="size-6 mr-3" src={EmailLogo} alt="EmailLogo" />
                    <span className="w-24 font-bold">Email:</span>
                    <span className="font-medium">{profileData.email}</span>
                </li>
                <li className="flex items-center">
                    <img className="size-6 mr-3" src={PhoneLogo} alt="PhoneLogo" />
                    <span className="w-24 font-bold">Phone:</span>
                    <span className="font-medium">{profileData.phone_number}</span>
                </li>
                <li className="flex items-center">
                    <img className="size-6 mr-3" src={AddressLogo} alt="AddressLogo" />
                    <span className="w-24 font-bold">Location:</span>
                    <span className="font-medium">{profileData.address}</span>
                </li>
                <li className="flex items-center">
                    <img className="size-6 mr-3" src={WebsiteLogo} alt="WebsiteLogo" />
                    <span className="w-24 font-bold">Website:</span>
                    <a 
                        href={`https://${profileData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline font-medium"
                    >
                        {profileData.website}
                    </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
