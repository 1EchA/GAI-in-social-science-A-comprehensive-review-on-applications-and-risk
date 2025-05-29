# encoding: utf-8
from math import log


def flatten_2d_array(arr):
    flattened = [element for sublist in arr for element in sublist]
    return flattened


def g2_statistics(corpus_counter, target_counter):
    c = sum(target_counter.values())
    c_d = sum(corpus_counter.values())
    word2g2 = {}
    for w, a in target_counter.items():
        a_b = corpus_counter[w]
        e1 = c*a_b/c_d
        if w:
            g2 = 2*a*log(a/e1)
            word2g2[w] = g2
    word2g2 = sorted(word2g2.items(), key=lambda x: x[1], reverse=True)
    return word2g2
