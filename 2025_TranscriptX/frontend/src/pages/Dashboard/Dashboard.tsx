import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaLink, FaDownload, FaTrash } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import checkSign from "../../assets/check-sign.svg";
import Copy from "../../assets/copy.svg";
import { getUserIdFromToken } from "../../utils/Helper";
import API_PATH from "../../api/API_PATH";

const Dashboard = () => {
  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  // const [originalList, setOriginalList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [viewFilter, setViewFilter] = useState("All");

  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [sharedLinkToShow, setSharedLinkToShow] = useState<string>("");

  const [loadingExport, setLoadingExport] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userID = token ? getUserIdFromToken(token) : null;

  const fetchWorkspaceData = async () => {
    if (!token || !userID) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = {
        userID,
        startDate: startDate || null,
        endDate: endDate || null,
        search: null,
        type: typeFilter === "All" ? null : typeFilter,
        sharedStatus:
          viewFilter === "All"
            ? null
            : viewFilter === "Shared"
            ? true
            : false,
        sortBy: null,
        sortOrder: null,
      };

      const res = await fetch(`${API_PATH}/api/workspaces/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        alert("User not authenticated. Please login.");
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (data.statusCode !== 200) throw new Error(data.message || "Failed to fetch");

      // Map response to format yang dipakai UI
      const list = data.payload
      .sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .map((item: any) => ({
        id: item.workspaceID,
        date: item.createdDate.split("T")[0],
        title: item.title,
        description: item.description,
        type: item.type,
        sharedLink: item.link || "-",
        originalPayload: item,
      }));

      // console.log("Workspaces to render in table:", list);

      setWorkspaceList(list);
      // setOriginalList(list);
    } catch (err: any) {
      setError(err.message || "Error fetching workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete workspace API (multiple IDs possible)
  const deleteWorkspace = async (workspaceIDs: string[]) => {
  if (!token || !userID) return false;
    try {
      const res = await fetch(`${API_PATH}/api/workspaces/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceID: workspaceIDs, userID }),
      });

      if (!res.ok) throw new Error("Failed to delete workspace");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;
    const success = await deleteWorkspace([workspaceToDelete]);
    if (success) {
      const updated = workspaceList.filter((w) => w.id !== workspaceToDelete);
      setWorkspaceList(updated);
      // setOriginalList(updated);
      setWorkspaceToDelete(null);
      setShowDeleteModal(false);
      setShowDeleteSuccess(false);
    } else {
      alert("Failed to delete workspace. Please try again.");
      return;
    }
  };

  const handleDelete = (id: string) => {
    setWorkspaceToDelete(id);
    setShowDeleteModal(true);
  };

  // Share workspace API
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

  const handleShare = async (currentLink: string, workspaceID: string) => {
    if (currentLink && currentLink !== "-") {
      setSharedLinkToShow(currentLink);
      setShowShareModal(true);
    } else {
      const link = await shareWorkspace(workspaceID);
      if (link) {
        setSharedLinkToShow(link);
        setShowShareModal(true);
        const updated = workspaceList.map((w) =>
          w.id === workspaceID ? { ...w, sharedLink: link } : w
        );
        setWorkspaceList(updated);
      } else {
        alert("Failed to create share link");
      }
    }
  };

  // Navigation handlers
  const handleViewWorkspace = (id: string) => {
    const selected = workspaceList.find((w) => w.id === id);
    if (selected) {
      navigate(`/view-workspace/${id}`, { state: selected.originalPayload });
    }
  };

  const handleEditWorkspace = (id: string) => {
    navigate(`/edit-workspace/${id}`);
  };
  // const handleExport = (id: string) => {
  //   const selected = workspaceList.find((w) => w.id === id);
  //   if (selected) navigate("/ExportWorkspace", { state: selected.originalPayload });
  // };

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
      var title;
      const selected = workspaceList.find((w) => w.id === workspaceID);
      if (selected) {
        title = selected.title;
      }
      
      // Respone adalah file PDF binary
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Download file PDF dengan nama workspace_title.pdf
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "workspace"}.pdf`;
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
    
  const closeModal = () => {
    setShowExportModal(false);
  };

  // Filtering
  const handleApplyFilters = () => {
    fetchWorkspaceData();
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setTypeFilter("All");
    setViewFilter("All");
    fetchWorkspaceData();
    setEndDateError("");
  };

  const styleTable = "border-l border-t border-black px-[6px] py-[3px] align-middle";

  return (
    <>
      <Navbar currentPage="Dashboard" />

      {/* Modal Share */}
      {showShareModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0">Successfully Created Share Link</h2>
            <img src={checkSign} alt="check" className="size-[96px] mb-[12px]" />

            <div className="flex flex-row items-center">
              <textarea
                value={sharedLinkToShow}
                readOnly
                className="w-[300px] p-3 border-grey rounded-md text-justify mb-4 resize-none"
                rows={1}
              />

              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(sharedLinkToShow)
                    .then(() => alert("Link copied to clipboard!"))
                    .catch(() => alert("Failed to copy link. Please try again."));
                }}
                className="py-2 px-6 bg-white border-l-2 border-r-0 border-t-0 border-b-0 text-black rounded-md hover:bg-blue-600 transition-all duration-300 ease-in-out cursor-pointer"
              >
                <img src={Copy} alt="copy" className="size-[14px]" />
              </button>
            </div>

            <p>____________________________________________</p>
            <button
              onClick={() => setShowShareModal(false)}
              className="bg-ijo text-color_primary font-bold px-[20px] py-[6px] mb-[8px] ml-auto mr-[10px] shadow border-none rounded hover:bg-ijoHover transition-all duration-300 ease-in-out shadow-[0_2px_3px_rgba(0,0,0,0.25)] cursor-pointer"
            >
              OK
            </button>
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0">Successfully Export Workspace</h2>
            <img src={checkSign} alt="check" className="size-[96px]" />
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

      {/* Main Content */}
      <div className="bg-white min-h-screen flex flex-col justify-start">
        <h1 className="text-[48px] text-center font-bold mb-[60px] mt-[100px]">Dashboard</h1>
        <div className="bg-white w-full max-w-[2000px]">
          {/* Filter Section */}
          <div className="flex flex-col justify-between mb-[50px] gap-[16px] pl-[25px]">
            <div className="flex flex-row gap-[16px]">
              <div className="flex flex-col items-start gap-[4px]">
                <label className="">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-[4px] border border-dark_grey rounded-md font-sans"
                />
              </div>
              <div className="flex flex-col items-start gap-[4px]">
                <label className="font-semibold">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const selectedEndDate = new Date(e.target.value)
                    const selectedStartDate = new Date(startDate)

                    if (selectedEndDate < selectedStartDate){
                      setEndDateError("End Date cannot be earlier than Start Date");
                      setEndDate('');
                    }else{
                      setEndDate(e.target.value);
                      setEndDateError("");
                    }
                  }}
                  className="p-[4px] border border-dark_grey rounded-md font-sans"
                />
                {endDateError && <p className="text-dark_red mt-[4px]">{endDateError}</p>}
              </div>
            </div>

            <div className="flex flex-row gap-[16px]">
              <div className="flex flex-col items-start gap-[4px]">
                <label className="font-semibold">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="p-[4px] border border-dark_grey rounded-md font-sans"
                >
                  <option value="All">All</option>
                  <option value="Summarization">Summarization</option>
                  <option value="Transcription">Transcription</option>
                </select>
              </div>
              <div className="flex flex-col items-start gap-[4px]">
                <label className="font-semibold">View:</label>
                <select
                  value={viewFilter}
                  onChange={(e) => setViewFilter(e.target.value)}
                  className="p-[4px] border border-dark_grey rounded-md font-sans"
                >
                  <option value="All">All</option>
                  <option value="Shared">Shared</option>
                  <option value="Not Shared">Not Shared</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-[8px]">
              <button
                onClick={handleApplyFilters}
                className="py-[4px] px-[8px] bg-color_secondary rounded-[10px] border-dark_grey text-black rounded hover:bg-dark_grey cursor-pointer hover:text-white"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="py-[4px] px-[8px] bg-light_red rounded-[10px] border-dark_grey text-black rounded hover:bg-dark_red cursor-pointer hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-center">Loading workspaces...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : workspaceList.length === 0 ? (
            <p className="text-center">No workspaces found.</p>
          ) : (
            <div className="overflow-hidden pb-[50px]">
              <table className="min-w-full max-w-full px-[20px] text-sm text-left table-auto">
                <thead className="bg-grey">
                  <tr className={styleTable}>
                    <th className={styleTable}>No.</th>
                    <th className={styleTable}>Date</th>
                    <th className={styleTable}>Title</th>
                    <th className={styleTable}>Description</th>
                    <th className={styleTable}>Type</th>
                    <th className={styleTable}>Shared URL</th>
                    <th className="border-t border-l border-r border-black px-[6px] py-[3px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaceList.map((w, index) => (
                    <tr key={w.id} className={
                      `${index % 2 === 0 ? "bg-white" : "bg-color_secondary"}`}>
                      <td className={`border-l border-t border-black px-[6px] py-[3px] align-middle ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>{index + 1}</td>
                      <td className={`border-l border-t border-black px-[6px] py-[3px] align-middle ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>{w.date}</td>
                      <td className={`border-l border-t border-black px-[6px] py-[3px] align-middle ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>{w.title}</td>
                      <td className={`border-l border-t border-black px-[6px] py-[3px] align-middle ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>{w.description}</td>
                      <td className={`border-l border-t border-black px-[6px] py-[3px] align-middle ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>{w.type}</td>
                      <td className={`border-l border-t border-black px-[6px] py-[3px] align-middle ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>{w.sharedLink || "-"}</td>
                      <td className={`border-l border-r border-t border-black px-[6px] py-[5px] flex flex-row h-[90px] justify-center items-center space-x-[4px] ${index === workspaceList.length - 1 ? "border-b border-black" : ""}`}>
                        <button
                          onClick={() => handleViewWorkspace(w.id)}
                          className="text-black bg-ijo border-none rounded-[4px] cursor-pointer py-[4px]"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditWorkspace(w.id)}
                          className="text-black bg-kuning border-none rounded-[4px] cursor-pointer py-[4px]"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleShare(w.sharedLink !== "-" ? w.sharedLink : "", w.id)}
                          className="text-black bg-minty border-none rounded-[4px] cursor-pointer py-[4px]"
                          title="Share"
                        >
                          <FaLink />
                        </button>
                        <button
                          onClick={() => handleExport(w.id)}
                          className="text-black bg-biru_muda border-none rounded-[4px] cursor-pointer py-[4px]"
                          title="Export"
                          disabled={loadingExport}
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="text-black bg-dark_red border-none rounded-[4px] cursor-pointer py-[4px]"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

