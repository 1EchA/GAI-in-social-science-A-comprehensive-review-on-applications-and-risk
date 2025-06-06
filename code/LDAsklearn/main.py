import pandas as pd
import nltk

output_path = 'lda/result'
file_path = 'lda/data'
data=pd.read_excel("lda/data/datamis1.xlsx")#content type
data=data.dropna()
dic_file = "lda/stop_dic/dict.txt"
stop_file = "lda/stop_dic/stopwords.txt"
# 1.预处理
#定义函数加载自定义停用词

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

def load_custom_stopwords(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        stopwords = set([word.strip() for word in file.readlines()])
    return stopwords

# 加载自定义的停用词
custom_stopwords = load_custom_stopwords(stop_file)

# 加载NLTK的英语停用词
nltk_stopwords = set(stopwords.words('english'))

# 合并NLTK的英语停用词和自定义停用词
combined_stopwords = nltk_stopwords.union(custom_stopwords)

combined_stopwords_list = list(combined_stopwords)

# 修改英文分词函数以使用合并后的停用词
def english_word_cut(mytext, combined_stopwords):
    if not isinstance(mytext, str):  # 确保传入的是字符串
        return ""
    word_list = []
    words = word_tokenize(mytext)
    for word in words:
        if word.lower() not in combined_stopwords and len(word) > 1:
            word_list.append(word)
    return " ".join(word_list)

# 使用合并后的停用词的分词函数
data["content_cutted"] = data.content.apply(lambda x: english_word_cut(x, combined_stopwords))



# 2.LDA分析



from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation


def print_top_words(model, feature_names, n_top_words):
    tword = []
    for topic_idx, topic in enumerate(model.components_):
        print("Topic #%d:" % topic_idx)
        topic_w = " ".join([feature_names[i] for i in topic.argsort()[:-n_top_words - 1:-1]])
        tword.append(topic_w)
        print(topic_w)
    return tword

n_features = 1000 #提取1000个特征词语
tf_vectorizer = CountVectorizer(strip_accents = 'unicode',
                                max_features=n_features,
                                stop_words=combined_stopwords_list,
                                max_df = 0.5,
                                min_df = 10)
tf = tf_vectorizer.fit_transform(data.content_cutted)

n_topics =4
lda = LatentDirichletAllocation(n_components=n_topics, max_iter=50,
                                learning_method='batch',
                                learning_offset=50,
#                                 doc_topic_prior=0.1,
#                                 topic_word_prior=0.01,
                               random_state=0)
lda.fit(tf)

#2.1输出每个主题对应词语

n_top_words = 25
tf_feature_names = tf_vectorizer.get_feature_names_out()
topic_word = print_top_words(lda, tf_feature_names, n_top_words)

#2.2输出每篇文章对应主题

import numpy as np

topics=lda.transform(tf)

topic = []
for t in topics:
    topic.append("Topic #"+str(list(t).index(np.max(t))))
data['概率最大的主题序号']=topic
data['每个主题对应概率']=list(topics)
data.to_excel("data_topic2.xlsx",index=False)

# 3.1 转换文档到主题分布
docs_topic_dist = lda.transform(tf)

# 3.2 获取每个词语在各个主题下的平均权重
# 这里假设 tf_feature_names 是从tf_vectorizer中获取到的词语名称列表
tf_feature_names = tf_vectorizer.get_feature_names_out()
word_weights = np.zeros((len(tf_feature_names), lda.n_components))
for i in range(lda.n_components):
    # 将LDA模型中每个主题的词语分布归一化
    topic_weights = lda.components_[i] / lda.components_[i].sum()
    word_weights[:, i] = topic_weights

# 3.3 找出特定词语 "study" 的索引
study_index = np.where(tf_feature_names == 'study')[0][0]

# 3.4 对每个文档，找出其包含 "study" 词语的权重最高的主题
max_topic_per_doc = np.argmax(word_weights[study_index] * docs_topic_dist, axis=1)

# 3.5 根据特定词语的主题权重，对所有文档进行排序
# 获取 "study" 词语在每个主题下的权重
study_weights_per_topic = word_weights[study_index]

# 初始化一个列表来存储每个文档的权重和索引
doc_weights = []

for doc_index, doc_topic in enumerate(docs_topic_dist):
    # 找出当前文档中 "study" 词语所在主题的权重
    study_weight = study_weights_per_topic[doc_topic.argmax()]
    doc_weights.append((doc_index, study_weight))

# 根据权重排序文档，降序排列
doc_weights.sort(key=lambda x: x[1], reverse=True)

# 3.6 输出权重最高的几篇文章的索引和权重
top_n = 5
top_docs = doc_weights[:top_n]

for doc_index, weight in top_docs:
    print(f"Document {doc_index} has a weight of {weight} for the word 'study'")

# 4.打印文档的主题以及主题概率信息
import json
from gensim.models import LdaModel
from gensim.corpora import Dictionary
from collections import defaultdict

# 获取文档的主题分布
topics_dist = lda.transform(tf)


from datetime import datetime
# 遍历每个文档，找到最可能的主题和对应的概率
docs_with_topics = []
for idx in range(len(topics_dist)):
    topic_probs = topics_dist[idx]
    max_topic_id = np.argmax(topic_probs)
    max_topic_p = topic_probs[max_topic_id]
    # 构造文档信息字典
    doc_info = {
        "id": idx,  # 假设DataFrame的索引是唯一的文档id
        "time": str(int(data.loc[data.index[idx], 'time'])),  # 确保time是字符串格式
        "topic_id": max_topic_id,
        "max_topic_p": max_topic_p.item()  # 使用.item()获取numpy float的Python float对应值
    }
    docs_with_topics.append(doc_info)

# 将列表中的所有数值转换为标准的Python int或float类型
docs_with_topics_fixed = [{k: int(v) if isinstance(v, np.integer) else float(v) if isinstance(v, np.floating) else v for k, v in doc.items()} for doc in docs_with_topics]

# 现在尝试将修正后的列表转换为JSON字符串
docs_with_topics_json = json.dumps(docs_with_topics_fixed, ensure_ascii=False, indent=4)

# 打印或保存JSON数据
print(docs_with_topics_json)
# 或者保存到文件
with open('data.json', 'w', encoding='utf-8') as f:
    f.write(docs_with_topics_json)



from collections import defaultdict

data['time'] = pd.to_datetime(data['time'], format='%Y', errors='coerce')
data['year'] = data['time'].dt.year.astype(int).fillna(1970)

# 5.定义年份窗口
windows = [
    ("2015", 2015),
    ("2016", 2016),
    ("2017", 2017),
    ("2018", 2018),
    ("2019", 2019),
    ("2020", 2020),
    ("2021", 2021),
    ("2022", 2022),
    ("2023", 2023),
    ("2024", 2024)
]

# 函数根据年份返回时间窗口名称
def get_window(year):
    year = int(year)
    for window_name, end_year in reversed(windows):  # 从最新的年份开始匹配
        if year >= end_year:
            return window_name
    return "2015及以前"

# 应用窗口函数到 'year' 列，创建 'window' 列
data['window'] = data['year'].apply(get_window)

# 获取 LDA 模型的组件和特征名称
tf_feature_names = tf_vectorizer.get_feature_names_out()
n_topics = lda.n_components

# 初始化 word_topics 数组，用于存储每个特征在各个主题上的概率
word_topics = np.zeros((len(tf_feature_names), n_topics))
for i in range(n_topics):
    lda_topic = lda.components_[i] / lda.components_[i].sum()
    word_topics[:, i] = lda_topic

# 初始化字典
words_info_by_window = defaultdict(list)

# 遍历每个时间窗口
for window_name in data['window'].unique():
    window_data = data[data['window'] == window_name]

    # 计算当前窗口的 TF-IDF
    tfidf_vectorizer = TfidfVectorizer(stop_words=combined_stopwords_list)
    tfidf_matrix = tfidf_vectorizer.fit_transform(window_data['content_cutted'])
    tfidf_feature_names = tfidf_vectorizer.get_feature_names_out()

    # 获取每个词语的 TF-IDF 值，并将其转换为字典
    tfidf_scores = tfidf_matrix.toarray().mean(axis=0)
    tfidf_scores_dict = dict(zip(tfidf_feature_names, tfidf_scores))

    # 收集词语信息并排序
    for word, value in tfidf_scores_dict.items():
        if word in tf_vectorizer.vocabulary_:
            word_index = tf_vectorizer.vocabulary_[word]
            topic_probs = word_topics[word_index]
            topic_probs = topic_probs / topic_probs.sum()  # 归一化处理
            top_prob_indices = topic_probs.argsort()[::-1][:3]  # 获取概率最高的三个主题索引
            pros = [{
                "topic_id": int(topic_id) + 1,
                "pro": round(topic_probs[topic_id], 3)
            } for topic_id in top_prob_indices]

            # 添加词语信息到对应窗口的列表
            words_info_by_window[window_name].append({
                "word": word,
                "value": value,  # TF-IDF 值
                "pros": pros,
                "window": window_name
            })

# 对每个时间窗口内的词语按 TF-IDF 值进行降序排序
for window_name in words_info_by_window:
    words_info_by_window[window_name] = sorted(
        words_info_by_window[window_name],
        key=lambda x: x['value'],
        reverse=True
    )

# 构建最终的 JSON 格式数据
final_json = [
    {
        "window": window_name,
        "words": words_info_by_window[window_name]
    }
    for window_name in sorted(words_info_by_window.keys(), key=lambda x: next(idx for idx, (name, _) in enumerate(windows) if name == x))
]

# 保存 JSON 数据到文件
with open('handled_data.json', 'w', encoding='utf-8') as f:
    json.dump(final_json, f, ensure_ascii=False, indent=4)

# 打印结果
print(json.dumps(final_json, ensure_ascii=False, indent=4))

# 6.保存模型
from joblib import dump

dump(lda, 'lda_model.joblib')
print("LDA model has been saved successfully.")

import pyLDAvis.lda_model
pic = pyLDAvis.lda_model.prepare(lda, tf, tf_vectorizer)
pyLDAvis.save_html(pic, 'lda_pass'+str(n_topics)+'.html')

import joblib
from joblib import dump

# 保存模型
dump(lda, 'lda_model.joblib')

# 7.困惑度
import matplotlib.pyplot as plt

plexs = []
scores = []
n_max_topics = 8
for i in range(1,n_max_topics):
    print(i)
    lda = LatentDirichletAllocation(n_components=i, max_iter=50,
                                    learning_method='batch',
                                    learning_offset=50,random_state=0)
    lda.fit(tf)
    plexs.append(lda.perplexity(tf))
    scores.append(lda.score(tf))

n_t=7#区间最右侧的值。注意：不能大于n_max_topics
x=list(range(1,n_t+1))
plt.plot(x,plexs[0:n_t])
plt.xlabel("number of topics")
plt.ylabel("perplexity")
plt.show()
plt.savefig('lda_model.png')
