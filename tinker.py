from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import socket

port=5001

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
	# The way of getting the IP address might not be platform-independent and may return 127.0.0.1 on Linux systems.
	# This is because Linux machines having the hostname in /etc/hosts as 127.0.0.1 could cause this behavior.
	# A potential solution could be to use socket.getfqdn() instead. For more details, refer to the discussion here: 
	# https://stackoverflow.com/questions/166506/finding-local-ip-addresses-using-pythons-stdlib
	ips = [ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith('127.')]

	if ips:
		print(f"access at http://{ips[0]}:{port}")
	else:
		print(f"No non-local IP found. Access may be available at http://127.0.0.1:{port}")

	socketio.run(app, host='0.0.0.0', debug=True, port=port)
