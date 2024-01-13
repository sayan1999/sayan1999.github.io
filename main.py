from flask import Flask, send_from_directory, render_template

app = Flask(__name__, static_folder="assets", template_folder="templates")


@app.route("/")
def index():
    return render_template(
        "index.html"
    )  # Assuming "index.html" is in the "static" folder


if __name__ == "__main__":
    app.run(debug=True)
