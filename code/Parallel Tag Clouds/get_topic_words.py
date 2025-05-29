import json
from ldamallet import *
data_path = r'static\data'
num_topics = 15
mallet_model = LdaMallet.load(os.path.join(data_path, 'mallet_model_phrase'))

topics = mallet_model.show_topics(num_topics=-1, num_words=100, formatted=False)
topics_ = {}
for topic_id, topic in enumerate(topics):
    words = []
    for word, score in topic[1]:
        words.append({'word': word, 'score': round(score, 5)})
    topics_[topic_id] = words

with open('word_cloud_data.json', 'w') as fw:
    json.dump(topics_, fw)
