// import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import RegisterPage from "./pages/authentication/RegisterPage";
import LoginPage from "./pages/authentication/LoginPage";
import ForgotPage from "./pages/authentication/ForgotPage";
import Tools from "./pages/Menu/Tools";
import DocumentSummarizer from "./pages/Menu/DocumentSummarizer";
import AudioVideoTranscription from "./pages/Menu/AudioVideoTranscription";
import Dashboard from "./pages/Dashboard/Dashboard";
import ViewWorkspace from "./pages/Dashboard/ViewWorkspace";
import EditWorkspace from "./pages/Dashboard/EditWorkspace";
import ExportWorkspace from "./pages/Dashboard/ExportWorkspace";
import ResetPage from "./pages/authentication/ResetPage";
import LandingPage from "./pages/landing/LandingPage";
import WorkspacePage from "./pages/Dashboard/WorkspacePage";

function App() {
	return (
		// <AuthProvider>
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/forgot" element={<ForgotPage />} />
				<Route path="/" element={<LandingPage />} />
				<Route path="/Tools" element={<Tools />} />
				<Route path="/document-summarizer" element={<DocumentSummarizer />} />
				<Route path="/audio-video-transcription" element={<AudioVideoTranscription />} />
				<Route path="/Dashboard" element={<Dashboard />} />
				<Route path="/view-workspace/:id" element={<ViewWorkspace />} />
				<Route path="/edit-workspace/:id" element={<EditWorkspace />} />
				<Route path="/ExportWorkspace" element={<ExportWorkspace />} />
				<Route path="/reset-password" element={<ResetPage />} />
				<Route path="/workspace/:id" element={<WorkspacePage />} />
				{/* <Route path="profile" element={<ProfilePage/>} /> */}
			</Routes>
		</BrowserRouter>
	);
}

export default App;
