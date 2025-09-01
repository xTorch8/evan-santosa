# Indonesian Audio Transcription Using XLSR-53 and MMS

### Authors
- Evan Santosa
- Alexander Brian Susanto
- Kelson
- Henry Wunarsa

### Project Description
This project focuses on developing an Indonesian audio transcription system using Massively Multilingual Speech (MMS) model. The project aim to address the performance gap in Automatic Speech Recognition (ASR) for Indonesian language, which often suffers from low accuracy due to limited training data and underrepresentation in mainstream ASR systems.

### Background
With the rapid growth of digital media, audio content has become one of the most common forms on information changes. However, accessing and analyzing spoken content remains a challenge, as audio data is less searchable and harder to process than text. Automatic Speech Recognition (ASR) systems play a crucial role in bridging this gap by converting speech into written text, enabling efficient information retrieval, accessibility, and further natural language processing tasks. Despite significant progress in ASR technology, the Indonesian language still lags behind due to limited pre-trained models. 

### Methods
- Dataset
    - Common Voice Corpus 20.0 for Indonesian Language
- Data Preprocessing
    - Wav2VecFeatureExtractor
    - Wav2VecCTCTokenizer
- Modeling
    - Fine-tuned XLSR-53 
    - Fine-tuned MMS

### Results
The MMS model outperformed XLSR-53, achieving 0.1306 CTC Loss and 0.3059 WER, indicating its effectiveness in Indonesian automatic speech recognition.

### Limitations
Even though the model can transcribe the audio generally well, the model face challenges in handling diverse Indonesian accents, dialects, and noisy real-world audio. The system also lacks proper punctuation and formatting, requiring further post-processing for readability.

### Tech Stacks
- PyTorch
- Transformer

### Impacts
This project enhances accessibility by converting Indonesian audio into text, making information easier to search and analyze. The fine-tuned MMS model has also downloaded 2400+ times (https://huggingface.co/xTorch8/mms-id-asr), indicating strong interest and real-world usage by the community.