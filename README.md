# SafeSearch
### AI-Powered Child Online Safety
**Explore the internet. Not its dangers.**

SafeSearch is an AI-powered browser safety system designed to help children explore the internet with an additional layer of protection. Built using a Chrome extension, a Flask backend, and four machine-learning classifiers, SafeSearch analyzes webpages for potentially harmful content, including hate speech, phishing, explicit content, and gambling-related imagery.

Instead of relying exclusively on static website blocklists, SafeSearch combines URL analysis, text classification, and visual content recognition to assess potential risks on a webpage and present an overall safety verdict.

Our mission is simple: **make online exploration safer for children without taking away the opportunity to learn, discover, and grow.**

---

## The Problem

The internet provides children with incredible opportunities for learning, creativity, and communication. However, not every online experience is safe or age-appropriate.

Children may unexpectedly encounter:

- **Hate speech and harmful language** that can contribute to harassment, cyberbullying, or exposure to discriminatory content.
- **Phishing websites and deceptive links** designed to trick users into revealing personal information or account credentials.
- **Explicit and age-inappropriate content** that children may encounter while browsing seemingly ordinary websites.
- **Gambling-related content and promotions** that may expose young audiences to risky behavior.

Traditional filtering solutions can depend on known blocked URLs or broad website categories. Such approaches may not identify every newly created website or harmful element embedded within an otherwise legitimate page.

Children also may not recognize deceptive links, inappropriate content, or potentially harmful online material on their own.

### The challenge

**How can we identify potentially harmful webpage content proactively, rather than relying only on known blocked websites?**

SafeSearch explores a solution by analyzing multiple aspects of a webpage through specialized AI models.

---

## Our Solution

**SafeSearch** is an AI-powered Chrome extension designed to make browsing safer for children by identifying potentially harmful websites before users interact with them. Instead of relying only on static blocklists or predefined website categories, SafeSearch combines URL analysis, webpage text classification, and visual content detection to assess potential online risks.

When a user navigates to a webpage, the Chrome extension communicates with a Python Flask backend. The backend extracts webpage text and captures a screenshot, then routes the relevant data through four specialized machine learning models. Their predictions are combined into a unified safety verdict that helps users make more informed browsing decisions.

### Four-Layer AI Safety Analysis

| Detection Layer | Input | Technology | Purpose |
|---|---|---|---|
| Hate Speech Detection | Extracted webpage text | XGBoost-based classifier | Identifies potentially hateful or abusive language. |
| Phishing Detection | Webpage URL | Trained URL classification model | Flags URLs predicted to be associated with phishing. |
| Explicit Content Detection | Extracted webpage text | TF-IDF vectorization and a trained classifier | Detects text associated with adult or explicit content. |
| Gambling Detection | Webpage screenshot | DenseNet121-based image classifier | Identifies visual content predicted to be associated with gambling. |

### Unified Safety Verdict

SafeSearch combines the outputs of all four classifiers into a single, easy-to-understand result.

- **Unsafe:** Returned when one or more classifiers identify a configured unsafe category.
- **Safe:** Returned when none of the classifiers identifies a configured unsafe category.

The system also returns individual model confidence values, where available, to support a more detailed view of the analysis.

### What Makes SafeSearch Different?

- **Multimodal detection:** Examines URLs, text, and visual webpage content rather than relying on a single input type.
- **Specialized classifiers:** Uses separate models for distinct categories of online risk.
- **Unified risk assessment:** Converts multiple predictions into one overall safety verdict.
- **Browser integration:** Connects AI-based analysis with a Chrome extension for a familiar browsing experience.
- **Extensible architecture:** Allows additional detection categories

---

## System Architecture

<p align="center">
  <img
    src="architecture_images/overall_arch.png"
    alt="SafeSearch System Architecture"
    width="100%"
  />
</p>

### How the pipeline works

1. **Navigation monitoring:** The Chrome extension detects a top-level navigation and initiates the scanning workflow.
2. **Webpage acquisition:** The extension sends the target URL to the Flask API.
3. **Content extraction:** The backend uses `scrape_website.py` to extract text and capture a screenshot.
4. **AI inference:** The relevant text, URL, and screenshot are processed by the four trained classifiers.
5. **Verdict aggregation:** The backend combines the predicted labels using predefined safety rules.
6. **Result delivery:** The API returns the verdict, category labels, confidence scores, and screenshot data.
7. **Browser response:** The extension displays the analysis and provides navigation choices.

---

## Machine Learning Approach

### 1. Hate Speech Detection

<img src="architecture_images/hate_speech_arch.png" width="500">

Dataset: https://www.kaggle.com/datasets/waalbannyantudre/hate-speech-detection-curated-dataset

The goal is to classify text as **Non-hate (0)** or **Hate (1)**. The workflow explores how combining text representations, class weighting, and hyperparameter tuning can improve the model's ability to identify hate speech, especially when the classes are imbalanced.

#### Dataset

The dataset contains text samples and binary labels. The modelling workflow uses the text content and its cleaned version to learn patterns associated with each class. The data is split into training and test sets, preserving the class proportions so evaluation reflects the dataset's imbalance.

#### Model Flow

1. **Preprocessing** — remove empty or duplicate text, prepare the binary labels, and split the data into training and test sets.
2. **Feature extraction** — represent text using word-level TF-IDF (unigrams and bigrams), character-level TF-IDF, and handcrafted text statistics such as text length, uppercase ratio, punctuation, URLs, and mentions.
3. **Class-weighted XGBoost** — use `scale_pos_weight` to give more importance to Hate examples, helping the model learn from the minority class.
4. **Hyperparameter tuning** — use `RandomizedSearchCV` with stratified 3-fold cross-validation to test combinations of XGBoost settings. Hate-class F1 is used as the selection metric, balancing precision and recall for the Hate label.
5. **Combined XGBoost** — combine the selected hyperparameters with class weighting, then fit the final pipeline on the training data.
6. **Evaluation** — evaluate predictions on the test set using Accuracy, Precision, Recall, F1-score, Macro F1, ROC-AUC, and visual diagnostics.

#### Best Combined Model — Evaluation

| Metric | Score |
|---|---:|
| Accuracy | **78.92%** |
| Hate Precision | **45.49%** |
| Hate Recall | **79.26%** |
| Hate F1-score | **57.80%** |
| Macro F1 | **71.88%** |
| ROC-AUC | **86.88%** |

#### Visualizations

### Model Performance Comparison
![Model performance comparison](model_outputs/hate_speech/1_model_performance_comparison.png)

### Confusion Matrix
![Confusion matrix](model_outputs/hate_speech/2_confusion_matrix.png)

### Precision–Recall Curve
![Precision–Recall curve](model_outputs/hate_speech/3_precision_recall_curve.png)

### ROC Curves
![ROC curves](model_outputs/hate_speech/4_roc_curves.png)

### Class Distribution
![Class distribution](model_outputs/hate_speech/5_class_distribution.png)


### 2. Phishing URL Detection

<img src="architecture_images/phishing_arch.png" width="500">

Dataset: https://www.kaggle.com/datasets/shashwatwork/web-page-phishing-detection-dataset

Classify URLs as `phishing` or `legitimate` using `dataset_phishing.csv`.

- **Features:** Character-level TF-IDF (3–5 character n-grams, up to 200K features) combined with engineered URL features such as URL length, subdomains, special characters, digit ratios, and phishing indicators.
- **Preprocessing:** Missing-value handling, duplicate cleaning, numerical imputation and scaling, and stratified dataset splitting.
- **Models:** Linear SVM (`LinearSVC`) and Logistic Regression, evaluated using precision, recall, F1-score, and ROC-AUC.
- **Selected Model:** Linear SVM, achieving **97.16% accuracy**, **97.26% phishing recall**, and **0.9941 ROC-AUC**.

#### Model Results

| Metric | Linear SVM | Logistic Regression |
|---|---:|---:|
| Accuracy | **97.16%** | 95.84% |
| Precision | 97.05% | 95.54% |
| Recall | **97.26%** | 96.17% |
| F1-score | **97.16%** | 95.86% |

#### Visualizations

| Model Comparison | Confusion Matrix |
|:---:|:---:|
| <img src="model_outputs/phishing/validation_model_comparison.png" width="320"> | <img src="model_outputs/phishing/validation_confusion_matrix.png" width="320"> |

| ROC Curve | Precision–Recall Curve |
|:---:|:---:|
| <img src="model_outputs/phishing/roc_curve_test.png" width="320"> | <img src="model_outputs/phishing/local_feature_sensitivity.png" width="320"> |

| Feature Importance |
|:---:|
| <img src="model_outputs/phishing/permutation_feature_importance.png" width="500"> |


### 3. Adult Content Classification

<img src="architecture_images/adult_content_arch.png" width="500">

Dataset: https://huggingface.co/datasets/valurank/Adult-content-dataset

#### Review
- Binary text classification: `adult` vs. `non-adult`
- Models: Logistic Regression, Linear SVM, and DistilBERT
- Data split: 65% training, 15% validation, 20% testing
- Best model: DistilBERT

#### Preprocessing
1. Normalize column names.
2. Remove rows with missing values.
3. Clean whitespace in text.
4. Normalize category labels.
5. Remove invalid labels and empty descriptions.
6. Encode `non-adult = 0`, `adult = 1`.
7. Remove duplicate text-label pairs.
8. Remove descriptions with conflicting labels.
9. Verify that both classes have sufficient samples.

#### Feature Engineering
1. Extract word-level TF-IDF features for classical models.
2. Use unigrams and bigrams.
3. Set TF-IDF maximum features to `100000` with sublinear term frequency.
4. Tokenize text using `distilbert/distilbert-base-uncased`.
5. Truncate sequences to 256 tokens and dynamically pad batches.

#### Models
- **Logistic Regression:** TF-IDF, `class_weight="balanced"`, `max_iter=1000`.
- **Linear SVM:** TF-IDF, `class_weight="balanced"`.
- **DistilBERT:** Fine-tuned pretrained transformer; best configuration selected using validation adult-class F1-score.

#### Test Results

| Metric | Logistic Regression | Linear SVM | DistilBERT |
|---|---:|---:|---:|
| Accuracy | 95.88% | 95.29% | **97.06%** |
| Adult Precision | **98.39%** | 96.83% | 96.97% |
| Adult Recall | 91.04% | 91.04% | **95.52%** |
| Adult F1-score | 94.57% | 93.85% | **96.24%** |
| ROC-AUC | 0.9952 | 0.9943 | **0.9968** |
| Average Precision | 0.9932 | 0.9922 | **0.9955** |

#### Best Model: DistilBERT

- Test accuracy: **97.06%**
- Adult precision: **96.97%**
- Adult recall: **95.52%**
- Adult F1-score: **96.24%**

#### Confusion Matrix

| Actual / Predicted | Non-Adult | Adult |
|---|---:|---:|
| Non-Adult | 101 | 2 |
| Adult | 3 | 64 |

#### Visualizations

![Test Model Comparison](model_outputs/adult_content/test_model_comparison.png)

![DistilBERT Confusion Matrix](model_outputs/adult_content/selected_confusion_matrix.png)


### 4. Gambling Image Detection

<img src="architecture_images/gambling_model_arch.png" width="500">

Dataset: https://huggingface.co/datasets/YashJain/UI-Elements-Detection-Dataset  
        https://www.kaggle.com/datasets/shenaozheng/ui-detection-for-gambling-sites

SafeSearch uses a transfer-learning-based image classifier to detect gambling-related content in webpage screenshots.

**Architecture & Training**
- **Backbone:** DenseNet121 pretrained on ImageNet, with the convolutional base frozen during training.
- **Classification head:** Global Average Pooling → Dense (64, ReLU) → Dropout (0.3) → Dense (1, Sigmoid).
- **Input:** Webpage screenshots resized to `224 × 224 × 3`, normalized to `[0, 1]`.
- **Data balancing:** Undersamples both classes to the size of the minority class.
- **Augmentation:** Random horizontal flips, rotations, zoom, brightness, and contrast adjustments to improve generalization.
- **Optimization:** Adam optimizer with binary cross-entropy loss, batch size `32`, and up to `10` epochs.
- **Regularization:** Early stopping monitors validation loss with patience `3` and restores the best weights.

**Inference & Evaluation**

The sigmoid output is thresholded at `0.5` to classify screenshots as `Gambling` or `Non-Gambling`. Performance is measured on the held-out test set using accuracy, ROC-AUC, precision, recall, F1-score, and a confusion matrix.


### Final Safety Verdict

The current implementation uses rule-based aggregation. If any of the four classifiers returns its configured unsafe label, the final verdict is `Unsafe`; otherwise, the verdict is `Safe`.

This approach is easy to interpret and demonstrates how multiple models can contribute to one browser safety decision. Its effectiveness depends on the quality of the individual models and their evaluation.

---

## Our Vision

We believe children should be able to explore the internet with fewer unexpected encounters with harmful content.

SafeSearch brings together text analysis, URL classification, and image recognition to demonstrate how AI can contribute to a more proactive approach to online safety.

**Safer browsing. Smarter detection. A better internet for young explorers.**

---

*Built for a hackathon using Python, Flask, TensorFlow, XGBoost, Scikit-learn, and the Chrome Extensions API.*
