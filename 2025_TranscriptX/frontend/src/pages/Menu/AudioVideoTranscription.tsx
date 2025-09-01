import { useState } from "react";
import Navbar from "../../components/Navbar";
import checkSign from "../../assets/check-sign.svg";
import { useNavigate } from "react-router-dom";
import Copy from "../../assets/copy.svg";
import API_PATH from "../../api/API_PATH"; 
import { getUserIdFromToken } from "../../utils/Helper";
import Loading from "../../assets/loading.svg";

const WORKSPACE_SHARE_ENDPOINT = `${API_PATH}/api/workspaces/share`;

const AudioVideoTranscription = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [summarizedText, setSummarizedText] = useState(""); 
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [isSummarized, setIsSummarized] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedLink, setSharedLink] = useState("");  
  const [workspaceID, setWorkspaceID] = useState<string | null>(null); // To store dynamic workspaceID
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSum, setIsLoadingSum] = useState(false);

  const inputStyle = "font-sans w-[480px] px-[4px] py-[12px] mt-[8px] inset-shadow-[0px_0px_2px_1px_rgba(0,0,0,0.25)] border border-dark_grey rounded-[5px] focus:outline-none focus:ring-2 focus:ring-dark_grey text-[16px] focus:shadow-[0,2px,1px,rgba(0,0,0,0.25)] focus:inset-shadow-none resize-none";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setIsTranscribed(false);
      setIsSummarized(false);
      setTranscriptionResult("");
      setSummarizedText("");
      setWorkspaceID(null); // Reset workspaceID on new file upload
    }
  };

  // Convert the file to base64 format for API request
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Transcription
  const handleTranscribe = async () => {
    if (file) {
      try {
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

        const fileBase64 = await convertFileToBase64(file);

        const payload = {
          userID: userID,
          name: workspaceTitle || null,
          description: workspaceDescription || null,
          file: fileBase64,
        };

        const response = await fetch(`${API_PATH}/api/tools/transcript`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          setTranscriptionResult(data.payload.result);
          setWorkspaceID(data.payload.workspaceID || null);
          setIsTranscribed(true);
          setFile(null); // RESET FILE agar summarize pakai workspaceID
        } else {
          alert("Failed to transcribe the audio/video. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while transcribing the audio/video.");
      } finally{
        setIsLoading(false);
      }
    }
  };

  // Handle Summarize
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

    setIsLoadingSum(true);

    try {
      let fileBase64: string | null = null;

      // Kirim file hanya kalau ada file dan belum ada workspaceID
      if (file && !workspaceID) {
        fileBase64 = await convertFileToBase64(file);
      }

      if (!fileBase64 && !workspaceID) {
        alert("Please upload a file or use an existing transcription to summarize.");
        setIsLoadingSum(false);
        return;
      }

      const payload = workspaceID
        ? {
            userID,
            name: workspaceTitle || null,
            description: workspaceDescription || null,
            file: null,
            workspaceID: workspaceID,
          }
        : {
            userID,
            name: workspaceTitle || null,
            description: workspaceDescription || null,
            file: fileBase64,
            workspaceID: null,
          };

      console.log("Summarize payload:", payload); // Debug

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
        setSummarizedText(data.payload.result);
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
      setIsLoadingSum(false);
    }
  };

  // Handle Share - Making API request to share workspace
  const handleShare = async () => {
    if (workspaceID) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated.");
        navigate("/login");
        return;
      }

      const payload = {
        workspaceID: workspaceID,
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
          alert("Failed to share workspace. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while sharing the workspace.");
      }
    }
  };

  // Export workspace data
  const handleExport = () => {
    const workspaceData = {
      title: workspaceTitle,
      description: workspaceDescription,
      transcription: transcriptionResult,
      summarizedText: summarizedText,
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
            <p className="text-[24px] font-[600] pb-[16px]">Transcribing Audio...</p>
            <div className="w-[48px] h-[48px] mx-auto">
              <img src={Loading} alt="Loading..." className="animate-spin size-[32px]" />
            </div>
          </div>
        </div>
      )}

      {isLoadingSum && (
        <div className="min-w-screen min-h-screen fixed inset-0 bg-white opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-center items-center">
            <p className="text-[24px] font-[600] pb-[16px]">Summarizing Transcript...</p>
            <div className="w-[48px] h-[48px] mx-auto">
              <img src={Loading} alt="Loading..." className="animate-spin size-[32px]" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen flex justify-center items-center">
        <div className="bg-white p-[60px] rounded-lg shadow-lg w-full max-w-[450px]">
          <h1 className="text-[36px] font-bold text-center mb-auto">Audio/Video Transcription</h1>

          {/* Deskripsi */}
          <p className="text-center text-lg">Transcribe your audio/video with the power of AI</p>

          {/* File Input */}
          <div className="flex flex-col items-center">
            <label className="text-black font-[600] mb-[5px]">Click here to Upload Audio/Video</label>
            <input
              placeholder="Upload Document"
              type="file"
              disabled={isLoading}
              onChange={handleFileChange}
              accept="audio/*,video/*"
              className="w-full text-darker_grey text-[18px] bg-color_secondary border-2 border-dark_grey rounded-[5px] p-[20px] cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.25)] hover:border-dark_grey hover:ring-2 hover:ring-dark_grey focus:ring-2 focus:ring-dark_grey"
            />
            {file && <div className="text-center text-[18px] text-black">{file.name}</div>}
          </div>

          <p className="text-start text-[14px] text-darker_grey">Supported extensions: .mp3, .wav, .mp4, .mov, .avi</p>

          <div className="flex flex-col items-center">
            <div className="mb-[16px]">
              <label className="block text-black font-[600] mb-2">Workspace Title</label>
              <input
                type="text"
                disabled={isTranscribed || isLoading || isSummarized}
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
                disabled={isTranscribed || isLoading || isSummarized}
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                className={inputStyle}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end mb-6">
            {!isTranscribed && (
              <button
                onClick={handleTranscribe}
                disabled={isLoading || !file}
                className={`py-[8px] px-[24px] mt-[10px] ${!file ? 'bg-color_secondary' : 'bg-pinky text-white hover:ring-1 hover:ring-light_pinky cursor-pointer border-light_pinky'} rounded-[5px] shadow-[0_1px_2px_rgba(240,114,174,0.25)] transition-all duration-400 ease-in-out`}
              >
                Transcribe
              </button>
            )}
          </div>

          <div className="flex flex-col items-center">
            {isTranscribed && (
              <div>
                <label className="block font-[600] mt-[10px]">Transcription Result:</label>
                <textarea
                  value={transcriptionResult}
                  readOnly
                  className={inputStyle}
                  rows={6}
                />

                {!isSummarized && (
                  <div className="flex justify-end mb-[12px]">
                    <button
                      onClick={handleSummarize}
                      disabled={isLoading}
                      className="py-[8px] px-[24px] mt-[20px] bg-biru_muda text-white hover:ring-1 hover:ring-biru_muda cursor-pointer border-biru_muda rounded-[5px] shadow-[0_1px_5px_rgba(50,173,230,0.25)] transition-all duration-400 ease-in-out"
                    >
                      Summarize
                    </button>
                  </div>
                )}

                {isSummarized && (
                  <div className="mt-6">
                    <label className="block font-[600] mt-[10px]">Summarized Result:</label>
                    <textarea
                      value={summarizedText}
                      readOnly
                      className={inputStyle}
                      rows={6}
                    />
                  </div>
                )}

                <div className="mt-4 flex space-x-[12px] justify-end">
                  <button
                    onClick={handleShare}
                    disabled={isLoading}
                    className="py-[8px] px-[24px] mt-[10px] bg-ijo text-white hover:ring-1 hover:ring-ijo cursor-pointer border-ijo rounded-[5px] shadow-[0_1px_5px_rgba(52,199,89,0.25)] transition-all duration-400 ease-in-out"
                  >
                    Share
                  </button>

                  <button 
                    onClick={handleExport}
                    disabled={isLoading}
                    className="py-[8px] px-[24px] mt-[10px] bg-minty text-white hover:ring-1 hover:ring-minty cursor-pointer border-minty rounded-[5px] shadow-[0_1px_2px_rgba(0,199,190,0.25)] transition-all duration-400 ease-in-out">
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

export default AudioVideoTranscription;
