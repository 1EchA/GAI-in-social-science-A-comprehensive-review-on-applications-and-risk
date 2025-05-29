import os
from ldamallet import *
data_path = r'static\data'
import numpy as np

# 加载Mallet模型
num_topics = 15
mallet_model = LdaMallet.load(os.path.join(data_path, 'mallet_model_phrase'))
print(mallet_model.word_topics[:, :5])
word = "leader"  # 要获取的词
word_id = mallet_model.id2word.token2id[word]
pros = mallet_model.word_topics[:, word_id]
print(word_id)
print(pros / np.sum(pros))
print(int(np.argmax(pros)))
