import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import API_PATH from "../../api/API_PATH";
import { getUserIdFromToken } from "../../utils/Helper";

const EditWorkspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shared, setShared] = useState(false);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showStopShareModal, setShowStopShareModal] = useState(false);

  const token = localStorage.getItem("token");
  const userID = token ? getUserIdFromToken(token) : null;

  // Load workspace detail if location.state tidak tersedia
  useEffect(() => {
    const fetchDetail = async () => {
      if (location.state) {
        const ws = location.state as any;
        setTitle(ws.title || "");
        setDescription(ws.description || "");
        setShared(Boolean(ws.sharedLink));
      } else if (id && token && userID) {
        try {
          const res = await fetch(`${API_PATH}/api/workspaces/detail`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ workspaceID: id, userID }),
          });
          if (!res.ok) throw new Error("Failed to fetch workspace detail");
          const data = await res.json();
          if (data.statusCode === 200) {
            setTitle(data.payload.title || "");
            setDescription(data.payload.description || "");
            setShared(Boolean(data.payload.sharedLink));
          } else {
            throw new Error(data.message || "Failed to fetch workspace detail");
          }
        } catch (err) {
          alert(err);
        }
      }
    };
    fetchDetail();
  }, [location.state, id, token, userID]);

  const closeModal = () => {
    setShowSubmitModal(false);
    setShowStopShareModal(false);
  };

  // Edit workspace API
  const editWorkspace = async () => {
    if (!token || !userID || !id) {
      alert("Missing authentication or workspace ID");
      return false;
    }
    try {
      const res = await fetch(`${API_PATH}/api/workspaces/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceID: id,
          userID,
          title,
          description,
          shared,
        }),
      });
      if (!res.ok) throw new Error("Failed to update workspace");
      const data = await res.json();
      if (data.statusCode !== 200) throw new Error(data.message || "Failed to update workspace");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Stop share API call (set shared = false)
  const stopSharingWorkspace = async () => {
    setShared(false);
    return editWorkspace();
  };

  const confirmSubmit = async () => {
    const success = await editWorkspace();
    if (success) {
      alert("Workspace updated successfully.");
      setShowSubmitModal(false);
      navigate("/Dashboard");
    } else {
      alert("Failed to update workspace. Please try again.");
    }
  };

  const confirmStopShare = async () => {
    const success = await stopSharingWorkspace();
    if (success) {
      alert("Workspace sharing stopped.");
      setShowStopShareModal(false);
      navigate("/Dashboard");
    } else {
      alert("Failed to stop sharing workspace. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/Dashboard");
  };

  const handleSubmit = () => setShowSubmitModal(true);
  // const handleStopShare = () => setShowStopShareModal(true);

  const inputStyle =
    "font-sans w-[480px] px-[4px] py-[12px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-dark_grey rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none";

  return (
    <>
      <Navbar currentPage="Dashboard" />

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0 max-w-[300px]">Are you sure you want to submit?</h2>
            <p className="text-center mt-4">Ensure all updates are correct before finalizing.</p>
            <p>____________________________________________</p>
            <div className="flex justify-end space-x-[8px] mb-[8px]">
              <button
                onClick={closeModal}
                className="bg-color_secondary text-black font-bold px-[12px] py-[4px] rounded-[4px] border-grey hover:bg-dark_grey cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="bg-ijo text-white font-bold px-[12px] py-[4px] rounded-[4px] border-ijo hover:bg-ijoHover hover:border-ijoHover cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Share Modal */}
      {showStopShareModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl max-w-[400px] font-bold mb-0">Are you sure you want to stop sharing?</h2>
            <p>____________________________________________</p>
            <div className="flex justify-end space-x-[8px] mb-[8px]">
              <button
                onClick={closeModal}
                className="bg-color_secondary text-black font-bold px-[12px] py-[4px] rounded-[4px] border-grey hover:bg-dark_grey cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmStopShare}
                className="bg-[red] text-white font-bold px-[12px] py-[4px] rounded-[4px] border-[red] hover:bg-darker_red hover:border-darker_red cursor-pointer"
              >
                Stop Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white min-h-screen flex flex-col justify-start items-center">
        <h1 className="text-3xl font-bold text-center mt-[100px]">EDIT WORKSPACE</h1>
        <div className="bg-white p-[60px] w-full max-w-[480px]">
          <div className="grid grid-cols-2 gap-[24px] mb-6">
            <div>
              <label className="block text-black font-[600]">Title</label>
              <input
                className={inputStyle}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-black font-[600] mt-[8px]">Description</label>
            <textarea
              className="font-sans w-full px-[4px] py-[12px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-dark_grey rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center mt-[8px]">
            <input
              className="size-[24px]"
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
            />
            <label className="text-black pl-[8px] ">Share this workspace</label>
          </div>
          <div className="flex flex-col items-end space-y-[8px] mt-[16px]">
            <div className="flex space-x-[8px]">
              <button
                onClick={handleCancel}
                className="bg-[red] text-white font-bold px-[32px] py-[6px] rounded-[4px] border-[red] hover:bg-darker_red hover:border-darker_red cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-ijo text-white font-bold px-[32px] py-[6px] rounded-[4px] border-ijo hover:bg-ijoHover hover:border-ijoHover cursor-pointer"
              >
                Submit
              </button>
            </div>
            {/* <button
              onClick={handleStopShare}
              className="bg-jingga text-white font-bold px-[20px] py-[6px] rounded-[4px] border-jingga hover:bg-jingga_hover hover:border-jingga_hover cursor-pointer"
            >
              Stop Share
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default EditWorkspace;
