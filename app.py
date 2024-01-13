import requests, json, os
from dotenv import load_dotenv
import traceback


def askAI(query):
    if query.strip():
        try:
            load_dotenv()
            resume = """
            Sayan Dey
            Machine Learning Engineer
            +91 9614955330  |  mr.sayan.dey@gmail.com  |  https://linkedin.com/in/sdey |  Hyderabad, India (IN)

            Proficient in Python and ML algorithms, I translate machine learning and Deep learning expertise into real-world challenges, seeking a role to delve deeper and innovate.


            Education

            B.Tech, Computer Science & Engineering (CGPA 9.1) | National Institute of Technology, Rourkela | 2017-2021
            Skills 
            Programming Languages / Frameworks:	Python (Proficient), C++(Intermediate), Sklearn, Keras, PyTorch 
            Tools:   Github actions CI/CD, Docker, MongoDB, Streamlit
            DSA & Algorithm, Machine Learning, Neural Networks, Deep Learning, Natural Language Processing (NLP), Computer Vision, LLMs, Bagging-Boosting, Recommendation System, Topic Modelling, Object-oriented Programming (OOPs)
            ExperienceSoftware Engineer | Qualcomm | Hyderabad IN | June 2021 to current
            Increased test automation by 50% on USB testing, streamlining regression testing and reducing external bugs.
            Boosted system power testing (10x faster), uncovering stability issues through extensive corner case coverage.
            Spearheaded testing for cutting-edge USB4 features, ensuring back compatibility with older test suites.
            Machine learning Intern | Qualcomm | Remote | May 2020 to August 2020
            Built & deployed high-recall log anomaly detector with 68% accuracy, leveraging LSTM & tree-depth parsing.
            Optimized sequence length through cross-validation and balanced recall & precision through ROC analysis.
            S/W Engineering Intern | Continental | Kolkata IN | May 2019 to July 2019
            Rebuilt a socket programming project in Golang, leveraging multithreading for improved performance.
            Mastered NoSQL database management (MongoDB) with proficiency in Bson data format.

            Achievements
            HackTheBuild Hackathon (Top 8): Built an ML web app for optimizing India's COVID vaccine distribution strategy.
            Qualcomm Impact Award 2023: Recognized for automating USB4 validation workflows on new software product
            Machine Learning Projects ( https://github.com/sayan1999 )

            Image Reverse Search with Google’s EfficientNet and Facebook’s FAISS library optimizing search efficiency through fast image embeddings and approximate nearest neighbor algorithms | Training speed: 65k images efficientnet-b2: 4 mins vs Resnet-152: 10 mins | CI-CD, Computer Vision, Streamlit, image embeddings | Demo: https://huggingface.co/spaces/Instantaneous1/search-by-image
            Playpick: A personalized movie recommender powered by Collaborative Filtering that gets better with user feedback and interaction, no need for OTT premiums to recommend you movies | Metrics AP@100=0.4604  AP@20 of 0.3795 | Model Quantization, MongoDB, Streamlit | Demo: https://pick-1-movie.streamlit.app
            Cricket-Prophet: A Live cricket score predictor that improves prediction with each ball played; outperforms run-rate or match-encounter based models | Metrics MSE: 11.68 in ODIs, MSE: 20.44 in T20s | CI-CD, Feature Engineering, Randomforest, Streamlit, Web Scraping | Demo: https://cricket-prophet.streamlit.app
            Web-Brief: No size limit summariser for web pages that has no limit on input token length achieved by recursively chunkifying long documents and summarizing the chunks iteratively | NLP, Bert, Document Chunkify, Nodejs, Chrome extension, hugging face | Demo: https://long-doc-summary.streamlit.app
            BERT-Video-Search: Abstractive summary & semantic search through Youtube video by grouping subtitles and perform vector similarity search with FAISS | CI-CD, S-BERT, Streamlit, vector embeddings, NLP, LLM, FAISS |Demo: https://huggingface.co/spaces/Instantaneous1/bert-video-search-and-jump
            Courses

            Stanford University: Machine Learning Foundations with Andrew Ng
            Databricks LLM101x | Large Language Models: Application through Production
            """

            prompt = (
                "Hiring manager has a query about Sayan Dey (a male developer who is good at coding), the query is: "
                + query
                + "\n, Go through Sayan's resume below carefully and provide concise and quality answer to the query on behalf of Sayan. \
                No matter what, don't say any negative things about Sayan or Sayan's short comings or weaknesses, \
                instead highlight positive points from the resume convincing the recruiter to recruit Sayan. \
                Don't make up any fake Information, if you don't know. \
                Don't talk about something that isn't related to Sayan's competency and skills. \
                Please don't use any markdown or special formatting, use plai text only. \
                Don't suggest any extra comments in your response also. This is Sayan's Resume for your reference: \n\n"
                + resume
            )
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="
                + os.environ["GOOGLE_API_KEY"]
            )

            data = {"contents": [{"parts": [{"text": prompt}]}]}

            headers = {"Content-type": "application/json; charset=UTF-8"}

            response = requests.post(url, headers=headers, json=data)

            if response.status_code == 200:
                response_json = json.loads(response.text)
                # Process the response content here
                return response_json["candidates"][0]["content"]["parts"][0]["text"]
            else:
                print("API request failed with status code:", response.status_code)
        except BaseException as e:
            traceback.print_exc()
            print(e)
            return "Internal processing error, please retry or refresh page!"
    else:
        return "Empty query not allowed"


from flask import Flask, request, jsonify, render_template

app = Flask(__name__, static_folder="assets", template_folder="templates")


@app.route("/askAI", methods=["POST"])
def handle_post():
    data = request.get_json()  # Retrieve JSON data from the request

    # Process the received JSON data here (e.g., perform calculations, store in a database)
    # ...

    # Create a response JSON
    response_data = {
        "message": "Data received successfully!",
        "processed_response": askAI(data["query"]),  # Replace with your processed data
    }
    resp = jsonify(response_data)
    resp.headers.add("Access-Control-Allow-Origin", "*")
    return (
        resp,
        200,
    )  # Return a JSON response with status code 200 (OK)


@app.route("/")
def index():
    return render_template(
        "index.html"
    )  # Assuming "index.html" is in the "static" folder


if __name__ == "__main__":
    app.run(debug=True)
