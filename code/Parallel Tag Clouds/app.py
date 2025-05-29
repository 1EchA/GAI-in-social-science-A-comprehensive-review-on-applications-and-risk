from flask import Flask, render_template, request, redirect, url_for
import json
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from ldamallet import *
from util import *
from gensim.models import LdaModel
from gensim.corpora.dictionary import Dictionary

app = Flask(__name__)

data_path = r'static\data'
with open(os.path.join(data_path, 'corpus.txt'), encoding='utf-8') as f:
    texts = f.readlines()

with open(os.path.join(data_path, 'data.json')) as f:
    dates = []
    for item in json.load(f):
        dates.append(item['time'])


data_path = r'static\data'
from gensim.models import LdaModel
from joblib import load

lda_model = load(os.path.join(data_path, 'lda_model.joblib'))

def get_document_topics(lda_model, bow, n=3):
    doc_lda = lda_model.get_document_topics(bow, minimum_probability=0.0, minimum_phi_value=0.0)
    top_topics = sorted(doc_lda, key=lambda x: x[1], reverse=True)[:n]
    return [{'topic_id': topic[0], 'pro': round(topic[1], 3)} for topic in top_topics]

def get_topic_pro(array, n=3):
    sorted_indices = np.argsort(-array)  # 对数组进行逆序排序，得到索引
    top_n_values = array[sorted_indices[:n]]
    top_n_indices = sorted_indices[:n]
    pros = []
    for i, v in zip(top_n_indices, top_n_values):
        pros.append({'topic_id': int(i), 'pro': round(float(v), 3)})
    return pros


@app.route('/')
def hello_world():
    return redirect(url_for('index'))


@app.route('/index')
def index():
    return render_template('index.html')


def get_document_topics(lda_model, bow):
    pass


@app.route('/get_data', methods=['POST'])
def get_data():
    window_num = int(request.form['window_num'])
    start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d')
    only_phrase = bool(int(request.form['only_phrase']))
    total_days = (end_date - start_date).days
    window_length = total_days // window_num
    window2corpus = defaultdict(list)
    top_n = 150
    corpus = []

    # 计算时间窗口的持续时间
    duration = (end_date - start_date) / window_num

    windows = []
    for i in range(window_num):
        window_start = start_date + i * duration
        window_end = start_date + (i + 1) * duration - timedelta(days=1)
        window_start_str = window_start.strftime("%Y-%m-%d")
        window_end_str = window_end.strftime("%Y-%m-%d")
        window_str = f"{window_start_str} ~ {window_end_str}"
        windows.append(window_str)

    for text, date in zip(texts, dates):
        date = datetime.strptime(date, '%Y-%m-%d')
        if start_date <= date <= end_date:
            window_id = (date - start_date).days // window_length
            for word in text.split(' '):
                window2corpus[window_id].append(word)
                corpus.append(word)
    corpus_counter = Counter(corpus)

    results = []
    for window_id, window_str in enumerate(windows):
        target_counter = Counter(window2corpus[window_id])
        words = []
        for word, value in target_counter.most_common(top_n):
            if only_phrase and '_' not in word:
                continue
            bow = [word]  # 假设word是单个词，如果是短语，需要相应修改
            pros = get_document_topics(lda_model, bow)
            words.append({'word': word, 'value': value, 'pros': pros})
        results.append({'window': window_str, 'words': words})

    return json.dumps(results)


if __name__ == '__main__':
    app.run(debug=True, port=8029)
