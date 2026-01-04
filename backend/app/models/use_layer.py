import tensorflow as tf
import tensorflow_hub as hub
from tensorflow.keras.layers import Layer

class USELayer(Layer):
    def __init__(self, **kwargs):
        super(USELayer, self).__init__(**kwargs)
        self.embed = hub.KerasLayer(
            "https://tfhub.dev/google/universal-sentence-encoder/4",
            trainable=False,
            dtype=tf.string
        )

    def call(self, inputs):
        return self.embed(inputs)

