import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Import Navbar
import SummarizerIcon from "../../assets/summarizer-icon.svg"
import TranscriptionIcon from "../../assets/transcription-icon.svg"

const cardStyle = "group w-[360px] h-[450px] bg-color_secondary border-[18px] border-t-[24px] border-b-[24px] rounded-[10px] border-grey transition-all duration-400 ease-in-out hover:w-[400px] hover:h-[500px] hover:cursor-pointer hover:text-[40px] flex flex-col items-center";
const textStyle = "text-center font-bold text-[20px] mb-[50px] mt-[50px] bg-grey px-[10px] py-[5px] rounded-[10px] transition-all duration-400 ease-in-out group-hover:scale-110 group-hover:mt-[60px]";
const imageStyle = "my-[50px] size-[126px] transition-all duration-400 ease-in-out group-hover:scale-110 group-hover:mt-[60px]";
const linkStyle = "no-underline text-black flex flex-col items-center w-[400px] h-[450px]"

const Tools = () => {
  return (
    <>
      {/* Menambahkan Navbar */}
      <Navbar currentPage="All Tools" />

      <div className="bg-white min-h-screen flex justify-center items-center"> {/* Menambahkan flex untuk memusatkan konten */}
        {/* Main Content */}
        <div className="flex justify-center space-x-[150px]"> {/* Menambah jarak antar kartu dengan space-x-20 */}
          
          {/* Document Summarizer Card */}
          <div className={cardStyle}>
            <Link to="/document-summarizer" className={linkStyle}>
              <h3 className={textStyle}>DOCUMENT SUMMARIZER</h3>
              <img src={SummarizerIcon} alt="Summarizer Icon" className={imageStyle} /> {/* Membesarkan gambar */}
            </Link>
          </div>

          {/* Video or Audio Transcription Card */}
          <div className={cardStyle}>
            <Link to="/audio-video-transcription" className={linkStyle}>
              <h3 className={textStyle}>VIDEO OR AUDIO TRANSCRIPTION</h3>
              <img src={TranscriptionIcon} alt="Transcription Icon" className={imageStyle} /> {/* Membesarkan gambar */}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tools;
