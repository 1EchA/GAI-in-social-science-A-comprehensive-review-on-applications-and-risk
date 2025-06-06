
import pandas as pd
import numpy as np
import plotly.express as px
import matplotlib.pyplot as plt
import umap
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split


import pandas as pd
import numpy as np

excel_path = 'data_topic.xlsx'


df = pd.read_excel(excel_path)

df = df.dropna()

df['wordcuts'] = df['wordcuts'].astype(str)


X = df.iloc[:, :-1]  # 特征数据是除了最后一列的所有列
y = df.iloc[:, -2]

y = y.values

print('Shape of X (main data): ', X.shape)
print('Shape of y (true labels): ', y.shape)

print("这是特征矩阵的前几行:\n", X.head())

print("这是标签数组的前几个元素:", y[:5])  # 打印前5个元素作为示例


from sklearn.feature_extraction.text import TfidfVectorizer
from umap import UMAP


vectorizer = TfidfVectorizer()
X_tfidf = vectorizer.fit_transform(df['wordcuts'])

reducer = UMAP(n_neighbors=5, min_dist=0.1, n_components=2)
X_umap = reducer.fit_transform(X_tfidf)

np.save('X_umap.npy', X_umap)
print("已保存降维后的特征矩阵。")

np.save('y_labels.npy', y)
print("运行到这里：标签数组已保存。")


import matplotlib.font_manager
from tempfile import NamedTemporaryFile
from fontTools import ttLib
import re

def get_google_font(fontname):
    api_fontname = fontname.replace(' ', '+')
    api_response = resp = requests.get(f"https://fonts.googleapis.com/css?family={api_fontname}:black,bold,regular,light")
    font_urls = re.findall(r'(https?://[^\)]+)', str(api_response.content))
    for font_url in font_urls:
        font_data = requests.get(font_url)
        f = NamedTemporaryFile(delete=False, suffix='.ttf')
        f.write(font_data.content)
        f.close()
        font = ttLib.TTFont(f.name)
        font_family_name = font['name'].getDebugName(1)
        matplotlib.font_manager.fontManager.addfont(f.name)
        print(f"Added new font as {font_family_name}")


get_google_font("Marcellus SC")
get_google_font("Great Vibes")

import matplotlib
matplotlib.rcParams["figure.dpi"] = 100

import datamapplot


import numpy as np
import requests
import io
X_umap_path = "X_umap.npy"
y_label_path = "y_labels.npy"
arxivml_data_map = np.load(X_umap_path)
arxivml_labels = np.load(y_label_path, allow_pickle=True)


fig, ax = datamapplot.create_plot(
    arxivml_data_map,
    arxivml_labels,
    label_wrap_width=15,
    label_over_points=True,
    dynamic_label_size=True,
    max_font_size=32,
    min_font_size=10,
    min_font_weight=200,
    max_font_weight=800,
)

plt.show()