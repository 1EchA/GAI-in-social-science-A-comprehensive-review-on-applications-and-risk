from collections import defaultdict
import pandas as pd
import numpy as np
import json
from joblib import dump

data['time'] = pd.to_datetime(data['time'], format='%Y', errors='coerce')
data['year'] = data['time'].dt.year.astype(int).fillna(1970)

# 定义年份窗口
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

# 根据年份返回时间窗口名称
def get_window(year):
    year = int(year)
    for window_name, end_year in reversed(windows):
        if year >= end_year:
            return window_name
    return "2015及以前"

# 创建 'window' 列
data['window'] = data['year'].apply(get_window)

# 获取 LDA 模型的组件和特征名称
tf_feature_names = tf_vectorizer.get_feature_names_out()
n_topics = lda.n_components

# 初始化 word_topics 数组，存储每个特征在各个主题上的概率
word_topics = np.zeros((len(tf_feature_names), n_topics))
for i in range(n_topics):
    lda_topic = lda.components_[i] / lda.components_[i].sum()
    word_topics[:, i] = lda_topic

# 初始化字典，按时间窗口组织词语信息
words_info_by_window = defaultdict(list)

# 遍历每个时间窗口
for window_name in data['window'].unique():
    window_data = data[data['window'] == window_name]

    # 计算当前窗口的 TF-IDF
    tfidf_vectorizer = TfidfVectorizer(stop_words=combined_stopwords_list)
    tfidf_matrix = tfidf_vectorizer.fit_transform(window_data['content_cutted'])
    tfidf_feature_names = tfidf_vectorizer.get_feature_names_out()

    # 获取 TF-IDF 值并转换为字典
    tfidf_scores = tfidf_matrix.toarray().mean(axis=0)
    tfidf_scores_dict = dict(zip(tfidf_feature_names, tfidf_scores))

    # 收集词语信息并排序
    for word, value in tfidf_scores_dict.items():
        if word in tf_vectorizer.vocabulary_:
            word_index = tf_vectorizer.vocabulary_[word]
            topic_probs = word_topics[word_index]
            topic_probs = topic_probs / topic_probs.sum()  # 归一化
            top_prob_indices = topic_probs.argsort()[::-1][:3]  # 获取概率最高的三个主题索引
            pros = [{
                "topic_id": int(topic_id) + 1,
                "pro": round(topic_probs[topic_id], 3)
            } for topic_id in top_prob_indices]

            words_info_by_window[window_name].append({
                "word": word,
                "value": value,  # TF-IDF 值
                "pros": pros,
                "window": window_name
            })

# 对每个时间窗口内的词语按 TF-IDF 值降序排序
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

# 保存 LDA 模型
dump(lda, 'lda_model.joblib')
print("LDA model has been saved successfully.")
