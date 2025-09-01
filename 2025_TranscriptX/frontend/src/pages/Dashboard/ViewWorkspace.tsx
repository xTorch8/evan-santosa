import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import checkSign from "../../assets/check-sign.svg";
import Copy from "../../assets/copy.svg";
import API_PATH from "../../api/API_PATH";
import { getUserIdFromToken } from "../../utils/Helper";

const ViewWorkspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // State untuk data workspace, loading, error, modal
  const [workspaceData, setWorkspaceData] = useState<any>(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showStopShareModal, setShowStopShareModal] = useState(false);
  const [shared, setShared] = useState(true);

  const [loadingExport, setLoadingExport] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Ambil token dan userID dari localStorage/helper
  const token = localStorage.getItem("token");
  const userID = token ? getUserIdFromToken(token) : null;

  // Fetch data jika belum ada dan ada id + token + userID
  useEffect(() => {
    if (!id || !token || !userID) return;

    setLoading(true);
    fetch(`${API_PATH}/api/workspaces/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ workspaceID: id, userID }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Workspace not found");
        return res.json();
      })
      .then((data) => {
        setWorkspaceData(data.payload);
        setError(null);
      })
      .catch((err) => setError(err.message || "Failed to load workspace"))
      .finally(() => setLoading(false));
  }, [id, token, userID]);

  // Format tanggal tampil
  const formattedDate =
    workspaceData?.createdDate && workspaceData.createdDate !== "-"
      ? new Date(workspaceData.createdDate).toLocaleDateString()
      : "-";

  const shareWorkspace = async (workspaceID: string) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_PATH}/api/workspaces/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceID, isGrantAccess: true }),
      });
      if (!res.ok) throw new Error("Failed to share workspace");
      const data = await res.json();
      return data.payload?.link || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const stopShareWorkspace = async (workspaceID: string) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_PATH}/api/workspaces/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceID, isGrantAccess: false }),
      });
      if (!res.ok) throw new Error("Failed to share workspace");
      const data = await res.json();
      return data.payload?.link || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Modal handlers
  const handleShare = async (workspaceId: string) => {
    const link = await shareWorkspace(workspaceId);
    if (link){
        const updated = workspaceList.map((w) => 
        w.id === id ? {...w, sharedLink: link } : w
      );
      setWorkspaceList(updated);
      setWorkspaceData((prevWorkspaceData: any) => ({
        ...prevWorkspaceData,
        sharedLink: link
      }));  
    }
    setShowShareModal(true);
  };

  const closeModal = () => {
    setShowShareModal(false);
    setShowDeleteModal(false);
  };

  // Edit workspace handler
  const handleEditWorkspace = (workspaceId: string | undefined) => {
    navigate(`/edit-workspace/${workspaceId}`);
  };

  const deleteWorkspace = async (id: string[]) => {
    if (!token || !userID) return false;
      try {
        const res = await fetch(`${API_PATH}/api/workspaces/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workspaceID: id, userID }),
        });
  
        // Accept any 2xx success response
        if (!res.ok) throw new Error("Failed to delete workspace");
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    };

  const handleDelete = (workspaceId: string | undefined) => {
    if (!workspaceId) return;
    console.log("Clicked delete on workspace ID:", workspaceId);
    setWorkspaceToDelete(workspaceId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    console.log("Confirming delete for ID:", workspaceToDelete);
    if (!workspaceToDelete) return;
    const success = await deleteWorkspace([workspaceToDelete!]);
    if (success) {
      const updated = workspaceList.filter((w) => w.id !== workspaceToDelete);
      setWorkspaceList(updated);
      setWorkspaceToDelete(null);
      setShowDeleteModal(false);
      setShowDeleteSuccess(false);
      navigate("/dashboard");
    } else {
      alert("Failed to delete workspace. Please try again.");
      return;
    }
  };

  // Copy link handler for share modal
  const copyLinkToClipboard = () => {
    if (workspaceData?.sharedLink) {
      navigator.clipboard
        .writeText(workspaceData.sharedLink)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy link. Please try again."));
    } else {
      alert("No link available to copy.");
    }
  };

  const handleExport = async (workspaceID: string) => {
    if (!token) {
      alert("Missing token or workspace data");
      return;
    }
    setLoadingExport(true);
    try {
      const res = await fetch(`${API_PATH}/api/workspaces/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceID }),
      });
  
      if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
      
      // Respone adalah file PDF binary
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Download file PDF dengan nama workspace_title.pdf
      const a = document.createElement("a");
      a.href = url;
      a.download = `${workspaceData?.title || "Untitled"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
      setShowExportModal(true);
        } catch (error) {
          alert("Failed to export workspace: " + (error as Error).message);
        } finally {
          setLoadingExport(false);
        }
    };
    
  const closeModalExport = () => {
    setShowExportModal(false);
  };

  const stopSharingWorkspace = async () => {
    setShared(false);
    return true;
  };

  const confirmStopShare = async () => {
    const success = await stopSharingWorkspace();
    if (success) {
      setShowStopShareModal(false);
      navigate("/dashboard");
    } else {
      alert("Failed to stop sharing workspace. Please try again.");
    }
  };

  const handleStopShare = async (workspaceId: string) => {
    const link = await stopShareWorkspace(workspaceId);
    if (link){
        const updated = workspaceList.map((w) => 
        w.id === id ? {...w, sharedLink: link } : w
      );
      setWorkspaceList(updated);
      setWorkspaceData((prevWorkspaceData: any) => ({
        ...prevWorkspaceData,
        sharedLink: link
      }));  
    }
    setShowStopShareModal(true);
  }

  const inputStyle =
    "font-sans w-full px-[4px] py-[6px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-dark_grey rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0_2px_1px_rgba(0,0,0,0.25)] focus:inset-shadow-none resize-none";
  const textStyle = "block text-black font-[600]";
  const formStyle = "mb-[18px]";

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar currentPage="Dashboard" />
        <div className="text-center mt-10">Loading workspace data...</div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar currentPage="Dashboard" />
        <div className="text-center mt-10 text-red-600">Error: {error}</div>
      </>
    );
  }

  // No data state
  if (!workspaceData) {
    return (
      <>
        <Navbar currentPage="Dashboard" />
        <div className="text-center mt-10 text-red-600">
          No workspace data available. Go back to Dashboard.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar currentPage="Dashboard" />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0">Successfully Export Workspace</h2>
            <img src={checkSign} alt="check" className="size-[96px]" />
            <p>____________________________________________</p>
            <button
              onClick={closeModalExport}
              className="bg-ijo text-color_primary font-bold px-[20px] py-[6px] mb-[8px] ml-auto mr-[10px] shadow border-none rounded hover:bg-ijoHover transition-all duration-300 ease-in-out shadow-[0_2px_3px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0">Successfully Created Share Link</h2>
            <img src={checkSign} alt="check" className="size-[96px] mb-[12px]" />
            <div className="flex flex-row items-center">
              <textarea
                value={workspaceData?.sharedLink || "-"}
                readOnly
                className="w-[300px] p-3 border-grey rounded-md text-justify mb-4 resize-none"
                rows={1}
              />
              <button
                onClick={copyLinkToClipboard}
                className="py-2 px-6 bg-white border-l-2 rounded-md hover:bg-blue-600 transition-all duration-300 ease-in-out cursor-pointer"
              >
                <img src={Copy} alt="copy" className="size-[14px]" />
              </button>
            </div>
            <p>____________________________________________</p>
            <button
              onClick={closeModal}
              className="bg-ijo text-color_primary font-bold px-[20px] py-[6px] mb-[8px] ml-auto mr-[10px] shadow border-none rounded hover:bg-ijoHover transition-all duration-300 ease-in-out shadow-[0_2px_3px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              OK
            </button>
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

      {/* Pop up Delete Success */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0 text-red-600">Success</h2>
            <p className="break-all max-w-[320px] text-center mb-4 mt-2 text-gray-700">
              Your workspace was successfully deleted.
            </p>
            <p>____________________________________________</p>
            <div className="flex flex-row justify-end space-x-[8px] mb-[16px]">
              <button
                onClick={() => {
                  setShowDeleteSuccess(false);
                  navigate("/dashboard");
                  confirmDelete();
                }}
                className="bg-ijo text-white font-bold px-[12px] py-[4px] rounded-[4px] border-ijo hover:bg-ijoHover cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0 text-red-600">Are you sure?</h2>
            <p className="break-all max-w-[300px] text-center mb-4 mt-2 text-gray-700">
              Do you want to delete this workspace?
              <br />
              This action cannot be undone.
            </p>
            <p>____________________________________________</p>
            <div className="flex flex-row justify-end space-x-[8px] mb-[16px]">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="bg-grey text-black font-bold px-[12px] py-[4px] rounded-[4px] border-grey hover:bg-dark_grey cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteSuccess(true);
                  setShowDeleteModal(false);
                }}
                className="bg-[red] text-white font-bold px-[12px] py-[4px] rounded-[4px] border-[red] hover:bg-darker_red cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen flex flex-col justify-start items-center">
        <h1 className="text-3xl font-bold text-center mt-[100px]">{workspaceData?.title || "Untitled"}</h1>
        <div className="bg-white p-[60px] w-full max-w-[1000px]">
          <div className="grid grid-cols-2 gap-[36px] mb-6">
            <div>
              <div className={formStyle}>
                <label className={textStyle}>Author</label>
                <input className={inputStyle} type="text" value={workspaceData?.author || "Unknown"} readOnly />
              </div>
              <div className={formStyle}>
                <label className={textStyle}>Created Date</label>
                <input
                  className={inputStyle}
                  type="text"
                  value={formattedDate}
                  readOnly
                />
              </div>
              <div className={formStyle}>
                <label className={textStyle}>Original File Name</label>
                <input
                  className={inputStyle}
                  type="text"
                  value={workspaceData?.fileName || "-"}
                  readOnly
                />
              </div>
            </div>

            <div>
              <div className={formStyle}>
                <label className={textStyle}>Shared Link</label>
                <input
                  className={inputStyle}
                  type="text"
                  value={workspaceData?.sharedLink || "-"}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className={formStyle}>
            <label className={textStyle}>Description</label>
            <textarea
              className={inputStyle}
              rows={4}
              value={workspaceData?.description || "-"}
              readOnly
            />
          </div>

          {workspaceData?.transcription && (
            <div className={formStyle}>
              <label className={textStyle}>Transcription Result</label>
              <textarea
                className={inputStyle}
                rows={4}
                value={workspaceData.transcription}
                readOnly
              />
            </div>
          )}

          {workspaceData?.summarization && (
            <div className={formStyle}>
              <label className={textStyle}>Summarization Result</label>
              <textarea
                className={inputStyle}
                rows={4}
                value={workspaceData.summarization}
                readOnly
              />
            </div>
          )}

          <div className="flex justify-end space-x-[12px]">
            {workspaceData?.sharedLink && shared ?
              <button
                onClick={() => handleStopShare(id || "Null")}
                className="bg-jingga text-white font-bold px-[24px] py-[6px] rounded-[4px] border-jingga hover:bg-jingga_hover hover:border-jingga_hover cursor-pointer"
              >
                Stop Share
              </button>
              :
              <button
                className="bg-ijo text-white font-bold px-[24px] py-[4px] rounded-[4px] border-ijo hover:bg-ijoHover hover:border-ijoHover cursor-pointer"
                onClick={() => handleShare(id || "Null")}
              >
                Share
              </button> 
            }


            
            <button
              className="bg-minty text-white font-bold px-[24px] py-[4px] rounded-[4px] border-minty hover:bg-minty_dark hover:border-minty_dark cursor-pointer"
              onClick={() => handleExport(id || "Null")}
              disabled={loadingExport}
            >
              Export
            </button>

            <button
              className="bg-kuning text-white font-bold px-[24px] py-[4px] rounded-[4px] border-kuning hover:bg-kuning_dark hover:border-kuning_dark cursor-pointer"
              onClick={() => handleEditWorkspace(id)}
            >
              Edit
            </button>
            <button
              className="bg-[red] text-white font-bold px-[24px] py-[4px] rounded-[4px] border-[red] hover:bg-darker_red hover:border-darker_red cursor-pointer"
              onClick={() => handleDelete(id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewWorkspace;

