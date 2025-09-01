# TranscriptX - BE

TranscriptX is an application to assist people with document summarizer and audio/video transcription. The backend for the application is store in this repository. The backend service is created using FastAPI and MySQL.

This project is authored by:

- Alexander Brian Susanto
- Evan Santosa
- Henry Wunarsa
- Kelson

Steps to run this project locally:

- Clone this repository.
- Create an empty local MySQL database.
- Create `.env` file and copy all of the attributes in the `.env.example` file. You can do this by running `cp .env.example .env` in the terminal.
- Make sure to configure these properties properly on `.env` based on your local database server:
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
- Make sure to configure these properties properly on `.env` based on chosen AI model (HuggingFace's Space) and your server load:
  - `TRANSCRIPTION_MODEL`
  - `SUMMARIZATION_MODEL`
  - `MAX_FILE_SIZE_MB`
- Create a virtual environment and switch to that environment. To create a virtual environment, follow these steps:
  - `python -m venv venv`
  - `venv\Scripts\activate`
  - `pip install fastapi uvicorn sqlmodel dotenv pymysql moviepy==1.0.3 pdfplumber python-docx bcrypt passlib jose pydantic[email] python-jose==3.4.0 xhtml2pdf gradio_client`
- Run the app locally using `uvicorn main:app --reload` in the terminal. If you run the project for the first time, it will automatically create migrations.
- If you run the project for the first time, after running the application, create a new terminal and fill the database with initial value with `python -m databases.seed_database`.
