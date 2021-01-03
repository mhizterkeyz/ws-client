function WSClient(connectionString = "") {
  const Events = {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    ERROR: "connect_error",
  };

  function CallBackManager() {
    const callBacks = {};

    const callBackKeyExists = (key) => {
      return !!callBacks[key];
    };

    this.registerCallback = (key, cb) => {
      if (callBackKeyExists(key)) {
        callBacks[key].push(cb);
      } else {
        callBacks[key] = [cb];
      }
    };

    this.call = (key, ...arguments) => {
      if (callBackKeyExists(key)) {
        const cbs = callBacks[key];
        cbs.forEach((cb, arrayPos) => {
          try {
            cb(...arguments);
          } catch (error) {
            console.log(
              `cb at pos ${arrayPos} of ${key} has errored - ${error.message}`
            );
          }
        });
      }
    };

    return this;
  }

  function Socket(connectionString = "", callbacks = new CallBackManager()) {
    if (!(callbacks instanceof CallBackManager)) {
      throw new Error("argument 2 must be of type CallBackManager");
    }
    const socket = new WebSocket(connectionString);

    socket.onopen = (ev) => {
      callbacks.call(Events.CONNECT, ev);
    };
    socket.onclose = (ev) => {
      callbacks.call(Events.DISCONNECT, ev);
    };
    socket.onerror = (ev) => {
      callbacks.call(Events.ERROR, ev);
    };
    socket.onmessage = ({ data: json }) => {
      let message;
      try {
        message = JSON.parse(json);
      } catch (error) {
        message = json || "";
      }

      callbacks.call(message.action, message.data);
    };

    this.send = (action, data) => {
      if (socket.readyState) {
        socket.send(JSON.stringify({ action, data }));
        return;
      }
      setTimeout(this.send, 100, action, data);
    };

    this.close = () => socket.close();

    return this;
  }

  const callbacks = new CallBackManager();
  const createSocket = () => {
    const socket = new Socket(connectionString, callbacks);

    this.emit = (action, data) => {
      if (Object.values(Events).includes(action)) return;
      socket.send(action, data);
    };

    this.close = () => socket.close();
  };
  const retryCreateSocket = () => {
    setTimeout(createSocket, 3000);
  };

  callbacks.registerCallback(Events.DISCONNECT, retryCreateSocket);
  createSocket();

  this.on = (action, cb) => {
    callbacks.registerCallback(action, cb);
  };

  return this;
}
