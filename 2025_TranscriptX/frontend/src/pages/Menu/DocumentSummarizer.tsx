import { useState } from "react";
import checkSign from "../../assets/check-sign.svg";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import Copy from "../../assets/copy.svg";
import API_PATH from "../../api/API_PATH";
import { getUserIdFromToken } from "../../utils/Helper";
import Loading from "../../assets/loading.svg";

const WORKSPACE_SHARE_ENDPOINT = `${API_PATH}/api/workspaces/share`;

const DocumentSummarizer = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [isSummarized, setIsSummarized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [workspaceID, setWorkspaceID] = useState<string | null>(null); // To store dynamic workspaceID
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedLink, setSharedLink] = useState(""); // To store the generated link

  const inputStyle =
    "font-sans w-[480px] px-[4px] py-[12px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-dark_grey rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0,2px,1px,rgba(0,0,0,0.25)] focus:inset-shadow-none resize-none";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setIsSummarized(false);
      setSummaryResult("");
      setWorkspaceID(null); // reset workspaceID on new file upload
    }
  };

  // Convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle summarize action
  const handleSummarize = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authorization token not found. Please log in.");
      navigate("/login");
      return;
    }

    const userID = getUserIdFromToken(token);

    if (!userID) {
      alert("Invalid token. Please log in again.");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      let fileBase64: string | null = null;

      if (file) {
        fileBase64 = await convertFileToBase64(file);
      }

      // Prepare payload: only one of file or workspaceID should be filled
      const payload = {
        userID,
        name: workspaceTitle || null,
        description: workspaceDescription || null,
        file: file ? fileBase64 : null,
        workspaceID: file ? null : workspaceID,
      };

      // Validate presence of file or workspaceID
      if (!payload.file && !payload.workspaceID) {
        alert("Please upload a file or select an existing transcription to summarize.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_PATH}/api/tools/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API response payload:", data.payload);
        setSummaryResult(data.payload.result);
        setWorkspaceID(data.payload.workspaceID); 
        setIsSummarized(true);
      } else {
        const errorData = await response.json();
        alert(`Failed to summarize: ${errorData.message || "Unknown error"}`);
        if (errorData.message === "Invalid or expired token. Please login."){
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error during summarization:", error);
      alert("An error occurred while summarizing.");
    } finally{
      setIsLoading(false);
    }
  };

  // Handle Share - Making API request to share workspace
  const handleShare = async () => {
    if (!workspaceID) {
      alert("Workspace ID is missing. Please summarize first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please login.");
      navigate("/login");
      return;
    }

    const payload = {
      workspaceID,
      isGrantAccess: true,
    };

    try {
      const response = await fetch(WORKSPACE_SHARE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setSharedLink(data.payload.link);
        setShowShareModal(true);
      } else {
        const errorText = await response.text();
        console.error("Share API error response:", errorText);
        alert(`Failed to share workspace: ${errorText}`);
      }
    } catch (error) {
      console.error("Error sharing workspace:", error);
      alert("An error occurred while sharing the workspace.");
    }
  };

  // Export workspace data
  const handleExport = () => {
    const workspaceData = {
      title: workspaceTitle,
      description: workspaceDescription,
      summary: summaryResult,
      fileName: file ? file.name : "Unnamed File",
    };
    navigate("/ExportWorkspace", { state: workspaceData });
  };

  // Close Modals
  const closeModal = () => {
    setShowShareModal(false);
  };

  return (
    <>
      {/* Navbar */}
      <Navbar currentPage="All Tools" />

      {/* Modal Pop-up for Share */}
      {showShareModal && (
        <div className="fixed inset-0 flex justify-center items-center min-w-screen min-h-screen z-48">
          <div className="fixed inset-0 flex justify-center items-center opacity-70 z-49 bg-color_primary min-w-screen min-h-screen"></div>
          <div className="bg-pop p-8 rounded-lg shadow-lg min-w-[400px] text-center z-51 relative flex flex-col items-center shadow-[3px_8px_10px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-bold mb-0">Successfully Created Share Link</h2>
            <img src={checkSign} alt="check" className="size-[96px] mb-[12px]" />
            <div className="flex flex-row items-center">
              <textarea
                value={sharedLink}
                readOnly
                className="w-[300px] p-3 border-grey rounded-md text-justify mb-4 resize-none"
                rows={1}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sharedLink)
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
              onClick={closeModal}
              className="bg-ijo text-color_primary font-bold px-[20px] py-[6px] mb-[8px] ml-auto mr-[10px] shadow border-none rounded hover:bg-ijoHover transition-all duration-300 ease-in-out shadow-[0,2px,3px,rgba(0,0,0,0.25)] cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="min-w-screen min-h-screen fixed inset-0 bg-white opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <p className="text-[24px] font-[600] pb-[16px]">Summarizing Document...</p>
            <div className="w-[48px] h-[48px] mx-auto">
              <img src={Loading} alt="Loading..." className="animate-spin size-[32px]" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[400px] mt-4">
          <h1 className="text-3xl font-bold text-center mb-1">Document Summarizer</h1>
          <p className="text-center text-lg">Summarize your document with the power of AI</p>

          <div className="flex flex-col items-center">
            <label className="text-black font-[600] mb-[5px]">Click here to Upload Document</label>
            <input
              type="file"
              disabled={isLoading}
              onChange={handleFileChange}
              accept=".txt,.doc,.docx,.pdf"
              className="w-full text-darker_grey text-[18px] bg-color_secondary border-2 border-dark_grey rounded-[5px] p-[20px] cursor-pointer shadow-[0,1px,4px,rgba(0,0,0,0.25)] hover:border-dark_grey hover:ring-2 hover:ring-dark_grey focus:ring-2 focus:ring-dark_grey"
            />
            {file && <div className="text-center text-[18px] text-black">{file.name}</div>}
          </div>

          <p className="text-start text-[14px] text-darker_grey">Supported extensions: .txt, .doc, .docx, .pdf</p>

          <div className="flex flex-col items-center">
            <div className="mb-[16px]">
              <label className="block text-black font-[600] mb-2">Workspace Title</label>
              <input
                type="text"
                disabled={isSummarized || isLoading}
                placeholder="Enter workspace title"
                value={workspaceTitle}
                onChange={(e) => setWorkspaceTitle(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div className="mb-6">
              <label className="block text-black font-[600] mb-2">Workspace Description</label>
              <textarea
                placeholder="Enter workspace description"
                disabled={isSummarized || isLoading}
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                className={inputStyle}
                rows={4}
              />
            </div>
          </div>

          {!isSummarized && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleSummarize}
                disabled={isLoading || !file}
                className={`py-[8px] px-[24px] mt-[10px] ${!file ? 'bg-color_secondary' : 'bg-biru_muda text-white hover:ring-1 hover:ring-biru_muda cursor-pointer border-biru_muda'} rounded-[5px] shadow-[0,1px,5px,rgba(50,173,230,0.25)] transition-all duration-400 ease-in-out`}
              >
                Summarize
              </button>
            </div>
          )}

          <div className="flex justify-center mb-[16px]">
            {isSummarized && (
              <div className="mt-4">
                <label className="block font-[600] mt-[10px]">Summary Result:</label>
                <textarea
                  value={summaryResult}
                  readOnly
                  className={inputStyle}
                  rows={6}
                />
                <div className="mt-4 flex space-x-[12px] justify-end">
                  <button
                    onClick={handleShare}
                    disabled={isLoading}
                    className="py-[8px] px-[24px] mt-[10px] bg-ijo text-white hover:ring-1 hover:ring-ijo cursor-pointer border-ijo rounded-[5px] shadow-[0,1px,5px,rgba(52,199,89,0.25)] transition-all duration-400 ease-in-out"
                  >
                    Share
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="py-[8px] px-[24px] mt-[10px] bg-minty text-white hover:ring-1 hover:ring-minty cursor-pointer border-minty rounded-[5px] shadow-[0,1px,2px,rgba(0,199,190,0.25)] transition-all duration-400 ease-in-out"
                  >
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentSummarizer;
