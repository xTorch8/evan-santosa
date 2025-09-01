import Navbar from "../../components/Navbar";
import heroImage from "../../assets/hero-section.png";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
	const navigate = useNavigate();

	return (
		<>
			<Navbar currentPage="None" />
			<div
				className="mt-[60px] w-full min-h-screen bg-cover bg-center flex items-center justify-center"
				style={{
					backgroundImage: `url(${heroImage})`,
				}}
			>
				<div className="p-10 w-1/3 block mx-auto font-sans">
					<h1 className="font-bold mb-0 text-center">Transcribe. Summarize. Understand.</h1>
					<p className="mt-0 text-center font-[21px]">
						Transform hours of reading into minutes of insight. TranscriptX uses advanced AI to transcribe and summarize audio, video, and text
						documents with exceptional speed and accuracy.
					</p>

					<button
						className="bg-ijo text-white block mx-auto px-[2rem] py-[1rem] border-none rounded-[0.5rem] hover:bg-ijoHover"
						onClick={() => navigate("/register")}
					>
						TRY US
					</button>
				</div>
			</div>

			<div className="py-[2rem]">
				<h1 className="text-center">Key Features </h1>
				<div className="w-[50%] block mx-auto mt-[2rem]">
					<div className="flex flex-row justify-center items-center">
						<div className="mx-[1rem] bg-color_secondary p-[1rem] w-full text-center">
							<h2> Fast and Accurate Transcription </h2>
							<p> Convert audio and video into clean, editable text instantly.</p>
						</div>
						<div className="mx-[1rem] bg-color_secondary p-[1rem] w-full text-center">
							<h2> Smart Summarization </h2>
							<p> Cut through the noise with clear, concise summaries tailored to your needs.</p>
						</div>
					</div>
				</div>
				<div className="w-[50%] block mx-auto mt-[1rem]">
					<div className="flex flex-row justify-center items-center">
						<div className="mx-[1rem] bg-color_secondary p-[1rem] w-full text-center">
							<h2> Searchable Insights </h2>
							<p> Make your content searchable and accessible. Easily find key quotes, topics, or action items in any document. </p>
						</div>
						<div className="mx-[1rem] bg-color_secondary p-[1rem] w-full text-center">
							<h2> Secure and Confidential </h2>
							<p> Built with enterprise-grade security to ensure your data remains private and protected. </p>
						</div>
					</div>
				</div>
			</div>

			<div className="py-[2rem]">
				<h1 className="text-center"> Use Cases </h1>
				<div className="w-[50%] block mx-auto mt-[2rem]">
					<div className="flex items-center gap-4 mb-4">
						<div className="w-[1.5rem] h-[1.5rem] bg-color_secondary mx-[1rem]"></div>
						<p className="text-[18px]"> Lecture and Research Notes </p>
					</div>
					<div className="flex items-center gap-4 mb-4">
						<div className="w-[1.5rem] h-[1.5rem] bg-color_secondary mx-[1rem]"></div>
						<p className="text-[18px]"> Meeting Recordings & Zoom Calls </p>
					</div>
					<div className="flex items-center gap-4 mb-4">
						<div className="w-[1.5rem] h-[1.5rem] bg-color_secondary mx-[1rem]"></div>
						<p className="text-[18px]"> Legal Depositions </p>
					</div>
					<div className="flex items-center gap-4 mb-4">
						<div className="w-[1.5rem] h-[1.5rem] bg-color_secondary mx-[1rem]"></div>
						<p className="text-[18px]"> Interview & Podcasts </p>
					</div>
					<div className="flex items-center gap-4 mb-4">
						<div className="w-[1.5rem] h-[1.5rem] bg-color_secondary mx-[1rem]"></div>
						<p className="text-[18px]"> Many more... </p>
					</div>
				</div>
			</div>

			<footer className="bg-color_secondary flex flex-row justify-between p-[1rem]">
				<p> TranscriptX - All Right Reserved </p>
				<button
					className="bg-ijo text-white  px-[2rem] py-[1rem] border-none rounded-[0.5rem] hover:bg-ijoHover"
					onClick={() => navigate("/register")}
				>
					TRY NOW
				</button>
			</footer>
		</>
	);
};

export default LandingPage;
