import os
import tensorflow as tf
import tensorflow_hub as hub
from tensorflow.keras.layers import Input, Dense, GlobalAveragePooling2D, Layer
from tensorflow.keras.models import Model
from tensorflow.keras.applications import Xception

# -------------------------
# Setup folders
# -------------------------
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# -------------------------
# 1️⃣ Image model (Xception)
# -------------------------
print("Creating image_model.h5...")
image_base = Xception(weights="imagenet", include_top=False, input_shape=(299, 299, 3))
x = image_base.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation="relu")(x)
image_output = Dense(1, activation="sigmoid")(x)

image_model = Model(image_base.input, image_output)
for layer in image_base.layers:
    layer.trainable = False

image_model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
image_model.save(os.path.join(MODEL_DIR, "image_model.h5"))
print("✅ image_model.h5 created")

# -------------------------
# 2️⃣ Video model (simple CNN)
# -------------------------
print("Creating video_model.h5...")
video_input = Input(shape=(64, 64, 3))
x = tf.keras.layers.Conv2D(16, 3, activation="relu")(video_input)
x = tf.keras.layers.MaxPooling2D(2)(x)
x = tf.keras.layers.Conv2D(32, 3, activation="relu")(x)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
video_output = Dense(1, activation="sigmoid")(x)

video_model = Model(video_input, video_output)
video_model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
video_model.save(os.path.join(MODEL_DIR, "video_model.h5"))
print("✅ video_model.h5 created")

# -------------------------
# 3️⃣ Audio model (simple 1D CNN)
# -------------------------
print("Creating audio_model.h5...")
audio_input = Input(shape=(16000, 1))  # 1 second audio @16kHz
x = tf.keras.layers.Conv1D(16, 3, activation="relu")(audio_input)
x = tf.keras.layers.MaxPooling1D(2)(x)
x = tf.keras.layers.Conv1D(32, 3, activation="relu")(x)
x = tf.keras.layers.GlobalAveragePooling1D()(x)
x = Dense(128, activation="relu")(x)
audio_output = Dense(1, activation="sigmoid")(x)

audio_model = Model(audio_input, audio_output)
audio_model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
audio_model.save(os.path.join(MODEL_DIR, "audio_model.h5"))
print("✅ audio_model.h5 created")

# -------------------------
# 4️⃣ & 5️⃣ URL + Email models (USE)
# -------------------------
print("Downloading Universal Sentence Encoder (USE)...")
use_url = "https://tfhub.dev/google/universal-sentence-encoder/4"

# Custom layer wrapper
class USELayer(Layer):
    def __init__(self):
        super(USELayer, self).__init__()
        self.use = hub.KerasLayer(use_url, trainable=False, dtype=tf.string)

    def call(self, inputs):
        return self.use(inputs)

print("✅ USE downloaded successfully")

def create_use_model(model_name):
    inp = Input(shape=(), dtype=tf.string)
    x = USELayer()(inp)
    x = Dense(512, activation="relu")(x)
    out = Dense(1, activation="sigmoid")(x)
    model = Model(inp, out)
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    path = os.path.join(MODEL_DIR, f"{model_name}_model.h5")
    model.save(path)
    print(f"✅ {model_name}_model.h5 created")

create_use_model("url")
create_use_model("email")



