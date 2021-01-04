# ws-client

This serves a wrapper around the native Websocket in a browser and enhances it in a weird kinda way. With this, you can do stuff like client.emit(event, message), which results in a JSON message in the form { "action": "event", "data": "message" } which can be parsed on the Websocket server to get the original object (The implementation on the server side is left to you, but this kinda makes it simple and obvious how it should be done).

You can also do stuff like client.on(event, callback), in this case, when the server sends an event in the JSON format like the one above, the client parses it and and calls every callback registered on the event, passing the 'data' part of the parsed JSON object as an argument to the callback function.

Feel free to contribute... Built this as I needed it for something I was doing at the time and thought it might be a good idea to share...
