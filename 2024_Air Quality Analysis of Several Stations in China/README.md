# Air Quality Analysis 

## Clone Repository
Buka folder tempat ingin meletakkan repository. Kemudian, jalankan command berikut pada terminal:
```
git init
git clone https://github.com/xTorch8/air_quality_analysis
cd air_quality_analysis
```

## Setup Environment - Anaconda
Buka Anaconda Powershell Prompt. Kemudian, pergi ke directory tempat repository local berada. Setelah itu, jalankan command berikut:
```
conda create --name main-ds python=3.12
conda activate main-ds
pip install -r requirements.txt
```

## Run steamlit app
Buka Visual Studio Code dengan cara menjalankan command berikut:
```
code .
```

Kemudian, buat terminal baru di Visual Studi code dan jalankan command berikut:
```
streamlit run main.py
```

Apabila tidak menggunakan Visual Studio Code, tetapi menggunakan text editor atau IDE lainnya, dapat menyesuaikan.