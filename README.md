# 🛡️ SafeSearch
### AI-Powered Child Online Safety
**Explore the internet. Not its dangers.**

SafeSearch is an AI-powered browser safety system designed to help children explore the internet with an additional layer of protection. Built using a Chrome extension, a Flask backend, and four machine-learning classifiers, SafeSearch analyzes webpages for potentially harmful content, including hate speech, phishing, explicit content, and gambling-related imagery.

Instead of relying exclusively on static website blocklists, SafeSearch combines URL analysis, text classification, and visual content recognition to assess potential risks on a webpage and present an overall safety verdict.

Our mission is simple: **make online exploration safer for children without taking away the opportunity to learn, discover, and grow.**

---

## 🚨 The Problem

The internet provides children with incredible opportunities for learning, creativity, and communication. However, not every online experience is safe or age-appropriate.

Children may unexpectedly encounter:

- 🗣️ **Hate speech and harmful language** that can contribute to harassment, cyberbullying, or exposure to discriminatory content.
- 🔗 **Phishing websites and deceptive links** designed to trick users into revealing personal information or account credentials.
- 🔞 **Explicit and age-inappropriate content** that children may encounter while browsing seemingly ordinary websites.
- 🎰 **Gambling-related content and promotions** that may expose young audiences to risky behavior.

Traditional filtering solutions can depend on known blocked URLs or broad website categories. Such approaches may not identify every newly created website or harmful element embedded within an otherwise legitimate page.

Children also may not recognize deceptive links, inappropriate content, or potentially harmful online material on their own.

### The challenge

**How can we identify potentially harmful webpage content proactively, rather than relying only on known blocked websites?**

SafeSearch explores a solution by analyzing multiple aspects of a webpage through specialized AI models.

---

## 💡 Our Solution

SafeSearch adds an AI-powered safety layer to web browsing.

When a user navigates to a webpage, the Chrome extension initiates a scan through the Flask backend. The backend extracts webpage text, evaluates the target URL, and captures a screenshot for visual analysis.

Four specialized machine-learning classifiers examine different risk categories. Their predictions are combined into a unified safety verdict, which is returned to the extension and displayed through a scanning or warning interface.

### Core detection capabilities

| Risk category | Detection approach | Intended benefit |
|---|---|---|
| Hate speech | XGBoost text classification | Flags potentially hateful language |
| Phishing | URL classification model | Identifies potentially deceptive URLs |
| Explicit content | TF-IDF + trained text classifier | Flags potentially explicit or age-inappropriate text |
| Gambling | DenseNet121 image classification | Detects gambling-related visual content |

By combining different inputs and classifiers, SafeSearch aims to provide broader risk coverage than a single-purpose content filter.

---

## ✨ Key Features

- **Browser-integrated scanning:** Initiates webpage analysis through a Chrome extension.
- **Multimodal risk analysis:** Combines URL, text, and screenshot-based detection.
- **Four specialized AI classifiers:** Evaluates hate speech, phishing, explicit content, and gambling-related imagery.
- **Unified safety verdict:** Aggregates individual classification labels into `Safe` or `Unsafe`.
- **Confidence scores:** Returns model confidence values for each category.
- **Warning interface:** Displays analysis results and navigation choices when a webpage is flagged.
- **Modular architecture:** Allows classifiers to be evaluated, improved, or replaced independently.
- **Extensible design:** Establishes a foundation for future parental controls and age-appropriate browsing policies.

---

## 🏗️ System Architecture

<p align="center">
  <img
    src="docs/safesearch-architecture.png"
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

## 🧠 Machine Learning Approach

### 1. Hate Speech Detection

- **Input:** Extracted webpage text.
- **Preprocessing:** Lowercasing, URL removal, and removal of non-alphabetic characters.
- **Model:** Trained XGBoost classifier.
- **Output:** `Hate` or `Non-hate`, with a confidence score.

This module helps identify potentially hateful language in webpage text.

### 2. Phishing URL Detection

- **Input:** Target webpage URL.
- **Model:** Trained URL phishing classifier.
- **Output:** `Phishing` or `Legitimate`, with a confidence score.

This module evaluates URLs for patterns learned during model training. It does not guarantee that every malicious website will be detected.

### 3. Explicit Content Detection

- **Input:** Extracted webpage text.
- **Preprocessing:** Text cleaning followed by TF-IDF vectorization.
- **Model:** Trained adult-content classifier.
- **Output:** `Adult` or `Non-adult`, with a confidence score.

This module identifies potentially explicit text and can help flag age-inappropriate material.

### 4. Gambling Image Detection

- **Input:** Captured webpage screenshot.
- **Preprocessing:** Resize to 224 × 224 pixels, normalize pixel values, and prepare the image tensor.
- **Model:** DenseNet121-based image classifier.
- **Output:** `gambling` or `non_gambling`, with a confidence score.

This module uses visual patterns to identify gambling-related imagery.

### Final Safety Verdict

The current implementation uses rule-based aggregation. If any of the four classifiers returns its configured unsafe label, the final verdict is `Unsafe`; otherwise, the verdict is `Safe`.

This approach is easy to interpret and demonstrates how multiple models can contribute to one browser safety decision. Its effectiveness depends on the quality of the individual models and their evaluation.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Browser interface | HTML, CSS, JavaScript |
| Browser integration | Chrome Extensions API, Manifest V3 |
| Backend | Python, Flask, Flask-CORS |
| Hate speech detection | XGBoost, Joblib |
| Phishing detection | Scikit-learn-compatible URL classifier |
| Explicit content detection | TF-IDF, Scikit-learn |
| Image classification | TensorFlow / Keras, DenseNet121 |
| Data processing | NumPy, Pillow |
| API communication | REST, JSON |
| Webpage processing | Custom scraping and screenshot capture |

---

## 📁 Project Structure

```text
SafeSearch/
├── app.py
├── scrape_website.py
├── models/
│   ├── hatespeech_classifier_xgb.pkl
│   ├── url_phishing_model.pkl
│   ├── adult_classifier.pkl
│   ├── tfidf_vectorizer.pkl
│   └── densenet_gambling_classifier_augmented.h5
├── templates/
│   └── index.html
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── scan.html
│   ├── scan.js
│   └── style.css
├── requirements.txt
└── README.md
```

*This is a representative structure. Adjust it to match your actual repository. Generated webpage screenshots and extracted text are runtime artifacts and generally should not be committed.*

---

## ⚙️ Installation and Setup

### Prerequisites

- Python version compatible with the installed TensorFlow release
- Google Chrome
- Trained model artifacts
- Git
- Required Python dependencies

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd SafeSearch
```

Replace `<YOUR_REPOSITORY_URL>` with your repository URL.

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

The dependencies should include the packages used by your application and scraper, such as Flask, Flask-CORS, NumPy, Joblib, Scikit-learn, XGBoost, TensorFlow, Pillow, and any scraper-specific libraries.

### 4. Verify model artifacts

Ensure the required model and vectorizer files are present in the `models/` directory.

Do not load model files from untrusted sources. Joblib and pickle-based artifacts can execute arbitrary code when deserialized.

### 5. Start the backend

```bash
python app.py
```

The Flask backend runs locally at:

```text
http://127.0.0.1:8000
```

### 6. Load the Chrome extension

1. Open `chrome://extensions` in Google Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the directory containing the extension's `manifest.json`.
5. Ensure the extension is enabled.
6. Confirm that the extension sends requests to `http://127.0.0.1:8000/analyze`.

Keep the Flask backend running while using the extension.

---

## 🔌 API Documentation

### Analyze a webpage

**Endpoint:** `POST /analyze`

**Request body:**

```json
{
  "url": "https://example.com"
}
```

**Response structure:**

```json
{
  "hate_speech": "Non-hate",
  "hate_conf": 0.96,
  "explicit": "Non-adult",
  "explicit_conf": 0.93,
  "phishing": "Legitimate",
  "phishing_conf": 0.98,
  "gambling": "non_gambling",
  "gambling_conf": 0.91,
  "safety_verdict": "Safe",
  "image_base64": "<base64-encoded-screenshot>"
}
```

The confidence values above are illustrative and do not represent measured results.

**Possible error responses:**

| HTTP status | Meaning |
|---|---|
| `400` | The URL is missing from the request |
| `500` | An error occurred during scraping, processing, or model inference |

---

## 🧪 Testing and Evaluation

SafeSearch should be tested with labeled safe and unsafe examples across all four detection categories.

### Recommended test cases

- Legitimate educational webpages.
- Labeled hate-speech and non-hateful text samples.
- Phishing and legitimate URL samples.
- Explicit and non-explicit text samples.
- Gambling and non-gambling screenshots.
- Redirects, inaccessible webpages, timeouts, and backend failures.
- Repeated navigation and browser restart scenarios.

For hackathon demonstrations, use controlled test pages or mock classifier responses rather than visiting real phishing or malware websites.

### Recommended evaluation metrics

- Precision
- Recall
- F1-score
- Confusion matrix
- False-positive rate
- False-negative rate
- End-to-end scanning latency

For a child-safety application, both false negatives and false positives matter. Missing harmful content can leave children exposed, while incorrectly flagging legitimate educational material can restrict access to useful resources.

Model confidence is not the same as verified accuracy. Evaluate each classifier on held-out data before making performance claims.

---

## 👨‍👩‍👧 Impact and Future Scope

SafeSearch aims to help families and educators make online browsing safer by adding automated content analysis to the browsing experience.

Potential future enhancements include:

- **Parental dashboard:** Safety summaries and configurable browsing policies.
- **Age-appropriate filtering:** Different policies for different age groups.
- **Explainable warnings:** Show which category triggered a warning and why.
- **Dynamic webpage analysis:** Better handling of changing content and embedded resources.
- **Faster scanning:** Model caching, startup loading, and inference optimization.
- **Privacy-focused processing:** Minimize collection and retention of webpage content.
- **Additional threat categories:** Extend detection after appropriate model training and evaluation.
- **Reliable navigation enforcement:** Verify that unsafe pages cannot load during scanning and that backend failures follow a deliberate safety policy.

These are future directions, not claims that all these capabilities are already implemented.

---

## 🔐 Privacy and Limitations

SafeSearch is an experimental safety aid and should not be treated as a guarantee of protection.

- Webpage text and screenshots may contain personal or sensitive information.
- The current implementation uses a local Flask backend, but local processing alone does not guarantee that content is never stored or exposed.
- The scraper must validate URLs, restrict access to internal network resources, and enforce timeouts and response-size limits.
- Classification models can produce false positives and false negatives.
- A `Safe` verdict does not guarantee that a webpage is trustworthy or appropriate for every child.
- Navigation interception and error handling require thorough testing before the extension can be relied upon to block unsafe pages consistently.

SafeSearch is designed to complement parental supervision, digital literacy, and established child-protection tools—not replace them.

---

## 🎯 Our Vision

We believe children should be able to explore the internet with fewer unexpected encounters with harmful content.

SafeSearch brings together text analysis, URL classification, and image recognition to demonstrate how AI can contribute to a more proactive approach to online safety.

**Safer browsing. Smarter detection. A better internet for young explorers.**

---

*Built for a hackathon using Python, Flask, TensorFlow, XGBoost, Scikit-learn, and the Chrome Extensions API.*
