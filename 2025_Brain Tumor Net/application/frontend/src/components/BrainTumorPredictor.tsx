import React, { useState } from "react";
import { Client } from "@gradio/client";
import brain from "../assets/brain.svg";
import upload from "../assets/upload.svg";
import checkmark from "../assets/checkmark.svg";
import exclamationmark from "../assets/exclamationmark.svg";
import testVideo from "../assets/galaxy_brain.mp4";
import Infotab from "../types/Infotab";
import Loading from "../assets/brain_loading.svg";
import glioma from "../assets/glioma.jpg";
import meningioma from "../assets/meningioma.jpg";
import pituitary from "../assets/pituitary.jpg";
import API_PATH from "../api/API_PATH";

const BrainTumorPredictor: React.FC = () => {
  const [predictResult, setPredictResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<any>(null);
  const [isActive, setisActive] = useState<Infotab>({activeTab: "Overview"});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setPreviewUrl(url)
    }
    };

    const handlePredict = async () => {
    if (!imageFile) return alert("Please upload an image first.");

    setLoading(true);
    try {
      const blob = await imageFile.arrayBuffer();
      const client = await Client.connect(API_PATH);

      const result = await client.predict("/predict", {
        image: new Blob([blob], { type: imageFile.type }),
      });

      const label = result.data;
      setPredictResult(label); 
    } catch (error) {
      console.error("Error in /predict:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    setPreviewUrl(null);
    setImageFile(null);
    setPredictResult(null);
  };

  const buttonStyle = "laptop:px-[16px] py-[8px] w-full laptop:max-w-[300px] phone:max-w-[75px] font-[600] border-none rounded-[4px] cursor-pointer hover:bg-light_grey transition-all duration-400 ease-in-out laptop:text-[18px] phone:text-[10px]";
  const ActiveStyle = "laptop:px-[72px] laptop:py-[8px] bg-grey laptop:min-w-[300px] phone:min-w-[75px] font-[600] text-[white] rounded-[4px] border-none transition-all duration-400 ease-in-out laptop:text-[18px] phone:text-[10px]";
  const TabStyle = "max-w-12/13 w-screen bg-dark_grey min-h-[400px] rounded-b-[16px]";
  const InfoStyle = "mx-[2rem] transition-opacity duration-500 ease-in-out";
  const OverviewStyle = "border-1 border-grey rounded-[8px] w-full laptop:max-w-1/2 h-full laptop:min-h-[150px] laptop:max-h-[150px] mb-[2rem] flex-col items-center justify-center text-start";
  const InfoOverviewStyle = "font-[600] laptop:text-[18px] phone:text-[16px] mx-[2rem]";
  const InfoTypeStyle = "flex laptop:flex-row phone:flex-col laptop:gap-[2rem] items-center mb-[2rem] bg-lighter_black p-[2rem] rounded-[8px]";
  const SymptomsStyle = "border-1 border-grey rounded-[8px] w-full h-full laptop:min-h-[100px] laptop:max-h-[100px] mt-[0.5rem] flex-col items-center justify-center text-start";
  const InfoSymptomsStyle = "font-[600] laptop:text-[18px] phone:text-[14px] mx-[2rem] mb-[0.5rem]";
  const InfoMoreSymptomsStyle = "mx-[2rem] my-[0px] laptop:text-[16px] phone:text-[12px]";
  const InfoDiagnosisStyle = "laptop:gap-[2rem] phone:gap-[1rem] items-center laptop:mb-[2rem] phone:mb-[1rem] bg-lighter_black p-[2rem] pt-[0.5rem] rounded-[8px]";
  const Header3Style = "laptop:text-[20px] phone:text-[14px]";
  const ParagraphStyle = "text-justify laptop:text-[18px] phone:text-[12px]";
  const Header2Style = "laptop:text-[24px] phone:text-[16px]";

  return (
    <main>
      {loading && (
        <div className="min-w-screen min-h-screen fixed inset-0 z-50 flex justify-center items-center">
          <div className="p-6 rounded-lg min-w-screen min-h-screen shadow-lg flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center min-h-screen min-w-screen z-50 bg-darker_grey/75">
              <p className="laptop:text-[28px] phone:text-[21px] font-[600] pb-[16px]">Analyzing MRI...</p>
              <div className="w-[48px] h-[48px] mx-auto flex flex-row justify-center">
                <img src={Loading} alt="Loading..." className="justify-center animate-spin laptop:size-[100px] phone:size-[75px]" />
              </div>  
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="flex flex-col items-center">
        <header className="bg-dark_grey border-b min-w-screen z-1">
          <div className="container px-[2rem] flex flex-row items-center">
            <img src={brain} alt="" className="laptop:size-[32px] phone:size-[18px] laptop:mr-[1rem] phone:mr-[0.5rem]"/>
            <h1 className="laptop:text-[32px] phone:text-[16px] font-bold">Brain Tumor Net</h1>
          </div>
        </header>

        {/* Hero Section */}
        <div className="w-screen bg-background">
          <div className="laptop:mt-[2rem] laptop:mb-[4rem] phone:mt-[2rem] phone:mb-[2rem]">
            <div className="laptop:p-[48px] phone:p-[24px] laptop:mx-[64px] phone:mx-[16px] laptop:min-h-[240px] phone:min-h-[120px] bg-light_black rounded-[16px]">
              <div className="flex laptop:flex-row phone:flex-col laptop:place-content-between laptop:gap-[8rem]">
                <div className="phone:mb-[32px] laptop:mr-[16px]">
                  <h2 className="laptop:text-[36px] phone:text-[20px] laptop:pl-[32px] laptop:mt-[14px]">
                    Early Detection Saves Lives
                  </h2>
                  <p className="laptop:pl-[32px] text-grey laptop:text-[18px] phone:text-[10px] laptop:text-start">
                    Our AI-powered tool helps medical professionals quickly <br />screen MRI scans for potential brain tumors, enabling <br /> faster diagnosis and treatment planning.
                  </p>
                  <div className="mt-[32px]">
                    <button
                      className="bg-biru border-none text-[white] rounded-[4px] laptop:px-[24px] laptop:py-[12px] phone:px-[16px] phone:py-[8px] laptop:ml-[32px] laptop:text-[14px] phone:text-[10px] cursor-pointer hover:bg-darker_biru"
                      onClick={() => document.getElementById("upload_section")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Try It Now
                    </button>  
                    <button
                      className="bg-light_black border-1 border-grey text-[white] rounded-[4px] laptop:px-[24px] laptop:py-[12px] phone:px-[16px] phone:py-[8px] laptop:ml-[16px] phone:ml-[8px] laptop:text-[14px] phone:text-[10px] cursor-pointer hover:bg-dark_grey"
                      onClick={() => document.getElementById("information_section")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Learn More
                    </button>
                  </div>   
                </div>
                <div className="flex flex-row phone:justify-center laptop:justify-center laptop:items-center laptop:w-2/3 z-0 bg-background laptop:py-[1rem] laptop:px-[0px] phone:p-[1rem]">
                  <video src={testVideo} autoPlay muted loop className="laptop:size-8/9 phone:size-full"></video>
                </div>  
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <section id="information_section" className="laptop:mb-[48px] phone:mb-[48px] flex flex-col justify-center items-center mt-[64px]">
          <h2 className="text-center laptop:text-[30px] phone:text-[20px]">About Brain Tumors</h2>
          <div className="flex justify-center items-center">
            <div className="flex flex-col justify-center items-center">
              <div className="w-screen flex flex-row justify-center laptop:place-content-evenly phone:place-content-evenly bg-light_black max-w-12/13 py-[1rem] rounded-t-[16px]">
                <button 
                  className={isActive.activeTab === "Overview" ? ActiveStyle : buttonStyle}
                  onClick={() => setisActive({activeTab: "Overview"})}
                  >Overview
                </button>

                <button 
                  className={isActive.activeTab === "Types" ? ActiveStyle : buttonStyle}
                  onClick={() => setisActive({activeTab: "Types"})}
                  >Types
                </button>

                <button 
                  className={isActive.activeTab === "Symptoms" ? ActiveStyle : buttonStyle}
                  onClick={() => setisActive({activeTab: "Symptoms"})}
                  >Symptoms
                </button>

                <button 
                  className={isActive.activeTab === "Diagnosis" ? ActiveStyle : buttonStyle}
                  onClick={() => setisActive({activeTab: "Diagnosis"})}
                  >Diagnosis
                </button>

              </div>  
              {isActive.activeTab === "Overview" && 
                <div className={TabStyle}>
                  <div className={InfoStyle}>
                    <h2 className={Header2Style}>What are Brain Tumors</h2>
                    <p className="laptop:text-[18px] phone:text-[12px] text-justify">Brain tumors are one of the most complicated and deadly Central Nervous System (CNS) diseases that are caused by abnormal, rapid, and uncontrolled brain cells. Unanticipated development of this disease may affect serious human functional problems and the possibility to spread to other organs. Hence, detecting and treating brain tumors from early stages is crucial, yet a challenging task.</p>  
                    <p className="laptop:text-[18px] phone:text-[12px] text-justify">Brain tumors can begin in the brain. These are called primary brain tumors. Sometimes, cancer spreads to the brain from other parts of the body. These tumors are secondary brain tumors, also called metastatic brain tumors.</p>
                    <div className="flex laptop:flex-row phone:flex-col place-content-between laptop:gap-[4rem] justify-center items-center text-center mt-[2rem]">
                      <div className={OverviewStyle}>
                        <p className={InfoOverviewStyle}>Primary Tumors</p>
                        <p className="mx-[2rem] text-justify laptop:text-[18px] phone:text-[12px]">Begin in the brain and typically don't spread to other organs. They can be non-cancerous or cancerous.</p>
                      </div>
                      <div className={OverviewStyle}>
                        <p className={InfoOverviewStyle}>Secondary Tumors</p>
                        <p className="mx-[2rem] text-justify laptop:text-[18px] phone:text-[12px]">Spread to the brain from cancers elsewhere in the body. They are always cancerous.</p>
                        <p></p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              }

              {isActive.activeTab === "Types" && 
                <div className={TabStyle}>
                  <div className={InfoStyle}>
                    <h2 className={Header2Style}>Common Types of Brain Tumors</h2>  
                    <div className={InfoTypeStyle}>
                      <img src={glioma} alt="glioma_image" className="laptop:size-[144px] phone:size-[108px]" />
                      <p className={ParagraphStyle}>
                        <h3 className={Header3Style}>Gliomas</h3>Gliomas are growths of cells that look like glial cells. The glial cells surround and support nerve cells in the brain tissue. Types of gliomas and related brain tumors include astrocytoma, glioblastoma, oligodendroglioma, and ependymoma. Gliomas can be <b>non-cancerous</b>, but <b>most are cancerous</b>. Glioblastoma is the most common type of cancerous brain tumor.
                      </p>  
                    </div>
                    
                    <div className={InfoTypeStyle}>
                      <img src={meningioma} alt="meningioma_image" className="laptop:size-[144px] phone:size-[108px]" />
                      <p className={ParagraphStyle}>
                        <h3 className={Header3Style}>Meningiomas</h3>Meningiomas are brain tumors that start in the membranes around the brain and spinal cord. Meningiomas are usually non-cancerous, but sometimes they can be cancerous. Meningiomas are the most common type of non-cancerous brain tumor.
                      </p>  
                    </div>
                    
                    <div className={InfoTypeStyle}>
                      <img src={pituitary} alt="pituitary_image" className="laptop:size-[144px] phone:size-[108px]" />
                      <p className={ParagraphStyle}>
                        <h3 className={Header3Style}>Pituitary Tumors</h3>Brain tumors can begin in and around the pituitary gland. This small gland is located near the base of the brain. Most tumors that happen in and around the pituitary gland are non-cancerous. Pituitary tumors happen in the pituitary gland itself. Craniopharyngioma is a type of brian tumor that happens near the pituitary gland.
                      </p>  
                    </div>
                    
                  </div>
                </div>
              }

              {isActive.activeTab === "Symptoms" && 
                <div className={TabStyle}>
                  <div className={InfoStyle}>
                    <h2 className={Header2Style}>Common Symptoms</h2>  
                    <p className={ParagraphStyle}>Symptoms of brain tumors vary depending on the tumor's size, type, and location. Some common symptoms include:</p>
                    <div className="grid laptop:grid-cols-3 laptop:gap-[2rem] phone:gap-[1rem] phone:mb-[2rem]">
                      <div className={SymptomsStyle}>
                        <p className={InfoSymptomsStyle}>Headaches</p>
                        <p className={InfoMoreSymptomsStyle}>Especially in the morning</p>  
                      </div>

                      <div className={SymptomsStyle}>
                        <p className={InfoSymptomsStyle}>Seizures</p>
                        <p className={InfoMoreSymptomsStyle}>In people without a history of seizures</p>
                      </div>

                      <div className={SymptomsStyle}>
                        <p className={InfoSymptomsStyle}>Vision problems</p>
                        <p className={InfoMoreSymptomsStyle}>Blurred vision, double vision</p>
                      </div>

                      <div className={SymptomsStyle}>
                        <p className={InfoSymptomsStyle}>Nausea</p>
                        <p className={InfoMoreSymptomsStyle}>Often with vomiting</p>
                      </div>

                      <div className={SymptomsStyle}>
                        <p className={InfoSymptomsStyle}>Memory issues</p>
                        <p className={InfoMoreSymptomsStyle}>Difficulty with recall</p>
                      </div>

                      <div className={SymptomsStyle}>
                        <p className={InfoSymptomsStyle}>Balance problems</p>
                        <p className={InfoMoreSymptomsStyle}>Difficulty walking</p>
                      </div>
                    </div>
                  </div>
                </div>
              }

              {isActive.activeTab === "Diagnosis" && 
                <div className={TabStyle}>
                  <div className={InfoStyle}>
                    <h2 className={Header2Style}>Diagnosis Methods</h2>  
                    <p className={ParagraphStyle}>Several tests and procedures are used to diagnose brain tumors:</p>
                    <div >
                      <div className={InfoDiagnosisStyle}>
                        <p className={ParagraphStyle}>
                          <h3 className={Header3Style}>Magnetic Resonance Imaging (MRI)</h3>Uses magnetic fields and radio waves to create detailed images of the brain. This is the most common and effective method for detecting brain tumors.
                        </p>  
                      </div>

                      <div className={InfoDiagnosisStyle}>
                        <p className={ParagraphStyle}>
                          <h3 className={Header3Style}>Computed Tomography (CT) Scan</h3>Uses X-rays to create detailed cross-sectional images of the brain.
                        </p>  
                      </div>

                      <div className={InfoDiagnosisStyle}>
                        <p className={ParagraphStyle}>
                          <h3 className={Header3Style}>Biopsy</h3>Removal of a small sample of tumor tissue for examination under a microscope.
                        </p>  
                      </div>
                    </div>
                  </div>
                </div>
              }

            </div>  
          </div>
        
        </section>

        {/* Upload and Detection Section */}
        <section id="upload_section" className="laptop:mb-[96px] phone:mb-[192px] laptop:mt-[64px] phone:mt-[32px]">
          <h2 className="text-center laptop:text-[30px] phone:text-[20px]">Brain Tumor Prediction Tool</h2>
          <div className="flex laptop:flex-row phone:flex-col">
            <div className="flex flex-col gap-[1rem] laptop:mr-[2rem] laptop:mb-[0rem] phone:mb-[2rem] items-center justify-center">

              <label>
                {previewUrl ? <img src={previewUrl} className="laptop:size-[15.5rem] phone:size-[7.75rem] border px-[6rem] py-[3rem]" /> : 
                  <div className="laptop:min-w-[405px] laptop:text-[18px] bg-white border-2 border-dashed border-grey rounded-[5px] px-[1rem] py-[6rem] cursor-pointer inset-shadow-[2px,6px,6px,rgba(0,0,0,0.25)] hover:border-light_grey hover:ring-2 hover:ring-grey focus:ring-2 focus:ring-grey text-center justify-center phone:min-w-[250px] phone:text-[9px]">
                    <img src={upload} alt="" className="laptop:size-[48px] phone:size-[30px]" />
                    <p className="font-[600] phone:text-[10px] laptop:text-[16px]">Click to upload your MRI scan here</p>
                  </div>
                }
                <input 
                  type="file"
                  accept="image/*" 
                  disabled={loading}
                  onChange={handleImageChange} 
                  hidden />
              </label>

              {previewUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute laptop:ml-[24rem] laptop:mb-[23rem] phone:ml-[17rem] phone:mb-[14rem] border border-biru rounded-[5px] text-[white] bg-biru laptop:text-[18px] phone:text-[12px] cursor-pointer hover:bg-darker_biru laptop:px-[8px] phone:px-[6px] hover:border-darker_biru"
                >
                  X
                </button>
              )}

              <button 
                onClick={handlePredict} 
                disabled={loading || !imageFile}
                className={imageFile ? "laptop:min-w-[445px] phone:min-w-[320px] text-center justify-center laptop:text-[18px] phone:text-[10px] laptop:py-[1rem] phone:py-[0.5rem] border-2 border-biru rounded-[5px] inset-shadow-[2px,6px,6px,rgba(0,0,0,0.25)] hover:border-darker_biru hover:ring-2 hover:ring-dark_grey focus:ring-2 focus:ring-dark_grey cursor-pointer hover:bg-darker_biru bg-biru text-[white]" : "laptop:min-w-[445px] phone:min-w-[320px] text-center justify-center laptop:text-[18px] phone:text-[10px] laptop:py-[1rem] phone:py-[0.5rem] border-2 border-dark_grey rounded-[5px] inset-shadow-[2px,6px,6px,rgba(0,0,0,0.25)] focus:ring-2 focus:ring-dark_grey"}>
                {loading ? "Loading..." : "Analyze MRI Scan"}
              </button>

            </div> 

            <div className="border border-grey laptop:min-w-[450px] laptop:min-h-[300px] phone:min-w-[265px] phone:min-h-[150px] flex flex-row justify-center items-center bg-dark_grey">
              {!predictResult && (
                <div className="laptop:text-[18px] phone:text-[10px]">
                  <p>Upload an MRI scan to see prediction results</p>
                </div>
              )}
              {predictResult && (
                <div>
                  {JSON.stringify(predictResult[0].label) === '"No Tumor"' ? (
                    <div className="flex flex-col justify-center items-center">
                      <img src={checkmark} className="laptop:size-[60px] phone:size-[30px] bg-light_ijo rounded-[60px] laptop:p-[12px] phone:p-[6px]" alt="" />
                      <p className="laptop:text-[28px] phone:text-[14px] text-center text-ijo">{JSON.stringify(predictResult[0].label)} Detected</p>
                      <p className="text-center laptop:text-[18px] phone:text-[9px] text-light_grey">While the scan <b>appears normal</b>, <br />please <b>consult a medical professional</b> for verification.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center">
                      <img src={exclamationmark} className="laptop:size-[48px] phone:size-[24px] bg-light_red rounded-[60px] laptop:p-[16px] phone:p-[8px]" alt="" />
                      <p className="laptop:text-[28px] phone:text-[14px] text-center text-[red]">{JSON.stringify(predictResult[0].label)} Detected</p>
                      <p className="text-center laptop:text-[18px] phone:text-[9px] text-light_grey">Please <b>talk to a medical professional</b>, <br />for further evaluation.</p>
                    </div>
                  )} 
                </div>
              )}  
            </div>
          </div>  
        </section>
      </div>
    </main>

    
  );
};

export default BrainTumorPredictor;