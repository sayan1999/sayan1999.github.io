import requests, json, os
from dotenv import load_dotenv
import traceback
import docx2txt, os
import glob


def download_and_convert_google_doc(url):
    file_id = url.split("/")[-2]

    os.system(f"gdown {file_id}")

    f = glob.glob("*.docx")[0]
    with open(f, "rb") as infile:
        doc = docx2txt.process(infile)
        print(doc)

    return doc


def askAI(query):
    if query.strip():
        try:
            load_dotenv()
            resume = download_and_convert_google_doc(
                "https://docs.google.com/document/d/1DEzxF0QiqXEyN63EkNvczGZQo8m2vYjD7oFuTBG5tc0/edit?usp=sharing"
            )

            prompt = (
                "Hiring manager has a query about Sayan Dey (a male developer who is good at coding), the query is: "
                + query
                + "\n, Go through Sayan's resume below carefully and provide concise and quality answer to the query on behalf of Sayan. \
                No matter what, don't say any negative things about Sayan or Sayan's short comings or weaknesses, \
                instead highlight positive points from the resume convincing the recruiter to recruit Sayan. \
                Don't make up any fake Information, if you don't know. \
                Don't talk about something that isn't related to Sayan's competency and skills. \
                Please don't use any markdown, bullet points, or special formatting, use plain text only. \
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
