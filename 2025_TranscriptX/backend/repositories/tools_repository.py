from datetime import datetime
from sqlmodel import Session, select
from databases.tr_workspace import TrWorkspace
from databases.tr_workspace_detail import TrWorkspaceDetail
from models.requests.transcript_request import TranscriptRequest
from models.requests.summarize_request import SummarizeRequest
from models.responses.response import Response
from models.responses.transcript_response import TranscriptResult
from models.responses.summarize_response import SummarizeResult
# from pipelines.summarization_pipeline import model as summarization_model, tokenizer as summarization_tokenizer
# from pipelines.transcription_pipeline import model as transcription_model, processor as transcription_processor
# from pipelines.language_model_pipeline import model as language_model
from http import HTTPStatus
from utils.base64_utils import get_safe_base64
from moviepy.editor import VideoFileClip
from docx import Document
from dotenv import load_dotenv
from gradio_client import Client, handle_file
import pdfplumber
import uuid
# import torch
# import torchaudio
import io
import os
import tempfile

class ToolsRepository:
    def __init__(self, db: Session):
        load_dotenv()
        self.db = db
        self.transcription_model = os.getenv("TRANSCRIPTION_MODEL")
        # self.transcription_processor = transcription_processor
        self.summarization_model = os.getenv("SUMMARIZATION_MODEL")
        # self.summarization_tokenizer = summarization_tokenizer
        # self.language_model = language_model
        self.max_tokens = 1024
        self.client_url = os.getenv("CLIENT_URL")

    async def transcript(self, request: TranscriptRequest, file_extension):
        try:
            # torchaudio.set_audio_backend("soundfile")
            client = Client(self.transcription_model)

            if file_extension == ".mp4":
                video_bytes = get_safe_base64(request.file)
                with tempfile.NamedTemporaryFile(delete = False, suffix = ".mp4") as tmp_video:
                    tmp_video.write(video_bytes)
                    tmp_video_path = tmp_video.name

                video = VideoFileClip(tmp_video_path)
                audio_stream = video.audio
                audio_path = tmp_video_path.replace(".mp4", ".wav")
                audio_stream.write_audiofile(audio_path)
                video.close()

                # waveform, sample_rate = torchaudio.load(audio_path, format = "wav")
                transcription = client.predict(
                    audio_stream = handle_file(audio_path),
                    is_video = True,
                    api_name = "/predict"
                
                )                
                os.remove(tmp_video_path)
                os.remove(audio_path)
            elif file_extension in [".mp3", ".wav", ".mpeg"]:
                audio_bytes = get_safe_base64(request.file)
                # audio_stream = io.BytesIO(audio_bytes)
                # waveform, sample_rate = torchaudio.load(audio_stream)
                with tempfile.NamedTemporaryFile(delete = False, suffix = ".wav") as tmp_file:
                    tmp_file.write(audio_bytes)
                    tmp_file_path = tmp_file.name

                transcription = client.predict(
                    audio_stream = handle_file(tmp_file_path),
                    is_video = False,
                    api_name = "/predict"
                )

                os.remove(tmp_file_path)
            else:
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "File must be in .wav, .mp3, .mp4, .mpeg format.",
                    payload = None
                )

            # target_sample_rate = 16000
            # if sample_rate != target_sample_rate:
            #     transform = torchaudio.transforms.Resample(orig_freq = sample_rate, new_freq = target_sample_rate)
            #     waveform = transform(waveform)

            # input_values = self.transcription_processor(waveform.squeeze().numpy(), return_tensors = "pt", sampling_rate = target_sample_rate).input_values

            # with torch.no_grad():
            #     logits = self.transcription_model(input_values).logits

            # predicted_ids = torch.argmax(logits, dim = -1)
            # transcription = self.transcription_processor.batch_decode(predicted_ids)[0]
            # transcription = self.language_model.restore_punctuation(transcription)

            workspace_id = str(uuid.uuid4())

            workspace = TrWorkspace(
                workspaceID = workspace_id,
                name = request.name,
                description = request.description,
                file = request.file,
                userID = request.userID  
            )

            workspace_detail = TrWorkspaceDetail(
                workspaceDetailID = str(uuid.uuid4()),
                workspaceID = workspace_id,
                toolsID = 2,
                link = None,
                result = transcription
            )

            self.db.add(workspace)
            self.db.add(workspace_detail)
            self.db.commit()

            return Response[TranscriptResult](
                statusCode = HTTPStatus.CREATED,
                message = None,
                payload = TranscriptResult(
                    result = transcription,
                    workspaceID = workspace_id
                )
            )
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )
        
    async def summarize(self, request: SummarizeRequest, file_extension):
        try:
            if request.workspaceID is not None:
                text = self.db.exec(
                    select(TrWorkspaceDetail.result)
                    .where(
                        TrWorkspaceDetail.workspaceID == request.workspaceID, 
                        TrWorkspaceDetail.isActive == True
                    )
                ).first()

                if text is None:
                    return Response(
                        statusCode = HTTPStatus.NOT_FOUND,
                        message = "Workspace ID is not found",
                        payload = None
                    )
                
                workspace_id = request.workspaceID

                workspace = self.db.exec(
                    select(TrWorkspace)
                    .where(
                        TrWorkspace.workspaceID == workspace_id,
                        TrWorkspace.isActive == True
                    )
                ).first()

                workspace.name = request.name
                workspace.description = request.description
                workspace.dateUp = datetime.utcnow()
            elif request.file is not None:
                file_data = request.file.split(",")[-1]
                file_bytes = get_safe_base64(file_data)

                with tempfile.NamedTemporaryFile(delete = False, suffix = file_extension) as tmp:
                    tmp.write(file_bytes)
                    tmp_path = tmp.name

                if file_extension == ".txt":
                    with open(tmp_path, "r", encoding = "utf-8") as f:
                        text = f.read()
                elif file_extension == ".pdf":
                    with pdfplumber.open(tmp_path) as f:
                        text = "\n".join([page.extract_text() for page in f.pages if page.extract_text()])
                elif file_extension == ".docx":
                    f = Document(tmp_path)
                    text = "\n".join([para.text for para in f.paragraphs])
                else:
                    return Response(
                        statusCode = HTTPStatus.BAD_REQUEST,
                        message = "File must be in .txt, .docx, or .pdf format.",
                        payload = None
                    )
                
                workspace_id = str(uuid.uuid4())

                workspace = TrWorkspace(
                    workspaceID = workspace_id,
                    name = request.name,
                    description = request.description,
                    file = request.file,
                    userID = request.userID  
                )

                self.db.add(workspace)
            else:
                return Response(
                    statusCode = HTTPStatus.BAD_REQUEST,
                    message = "Invalid model state",
                    payload = None
                )
            
            # chunk_size = self.max_tokens * 4
            # overlap = chunk_size // 4 
            # step = chunk_size - overlap
            # chunks = [text[i:i + chunk_size] for i in range(0, len(text), step)]

            # summaries = []
            # for chunk in chunks:
            #     inputs = self.summarization_tokenizer(chunk, return_tensors = "pt", truncation = True, max_length = 1024, padding = True)
            #     with torch.no_grad():
            #         summary_ids = self.summarization_model.generate(
            #             **inputs,
            #             max_length = 1500,
            #             length_penalty = 2.0,
            #             num_beams = 4,
            #             early_stopping = True
            #         )
            #     summary = self.summarization_tokenizer.decode(summary_ids[0], skip_special_tokens = True)
            #     summaries.append(summary)

            # final_text = " ".join(summaries)
            # summarization = final_text
            # if len(final_text) > self.max_tokens:
            #     inputs = self.summarization_tokenizer(final_text, return_tensors = "pt", truncation = True, max_length = 1024, padding = True)
            #     with torch.no_grad():
            #         summary_ids = self.summarization_model.generate(
            #             **inputs,
            #             min_length = 300,
            #             max_length = 1500,
            #             length_penalty = 2.0,
            #             num_beams = 4,
            #             early_stopping = True
            #         )
            #     summarization = self.summarization_tokenizer.decode(summary_ids[0], skip_special_tokens = True)
            # else:
            #     summarization = final_text  
            client = Client(self.summarization_model)
            summarization = client.predict(
                text = text,
                api_name = "/predict"
            )

            workspace_detail = TrWorkspaceDetail(
                workspaceDetailID = str(uuid.uuid4()),
                workspaceID = workspace_id,
                toolsID = 1,
                link = None,
                result = summarization
            )

            self.db.add(workspace_detail)
            self.db.commit()

            return Response[SummarizeResult](
                statusCode = HTTPStatus.CREATED,
                message = None,
                payload = SummarizeResult(
                    result = summarization,
                    workspaceID = workspace_id
                )
            )
        except Exception as e:
            return Response(
                statusCode = HTTPStatus.INTERNAL_SERVER_ERROR,
                message = str(e),
                payload = None
            )