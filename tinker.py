from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import socket

app = Flask(__name__)
socketio = SocketIO(app)

def broadcast(name, value):
	emit(name, value, broadcast=True, include_self=False)

@socketio.on('connect')
def test_connect():
	print('connected')
	emit('after connect',  {'data':'Lets dance'})

@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)

@socketio.on('hex')
def handle_hex(val):
	broadcast('hex', val)

@socketio.on('audio')
def handle_audio(val):
	broadcast('audio', val)

@socketio.on('pauseAudio')
def handle_pause(val):
	broadcast('pauseAudio', val)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
	print(f"access at http://{socket.gethostbyname(socket.gethostname())}:5000")
	socketio.run(app, host='0.0.0.0', debug=True)