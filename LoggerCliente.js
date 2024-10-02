// LoggerClient.js
export default class LoggerClient {
  constructor({ HOST_SERVER, PORT_SERVER }) {
    this.host = HOST_SERVER;
    this.port = PORT_SERVER;
    this.socketClient = null;
    this.isConnected = false;
    this.#connectToServer();
  }

  #connectToServer() {
    this.socketClient = new WebSocket(`ws://${this.host}:${this.port}`);

    this.socketClient.onopen = this.#connectPrivate;
    this.socketClient.onerror = this.#errorPrivate;
    this.socketClient.onclose = this.#closePrivate;
  }

  #connectPrivate = () => {
    console.log(`Conectado al servidor ${this.host}:${this.port}`);
    this.isConnected = true;
  };

  #errorPrivate = (err) => {
    console.error(`Error en la conexión: ${err.message}`);
    this.isConnected = false;
  };

  #closePrivate = () => {
    console.log(`Conexión cerrada con el servidor ${this.host}:${this.port}`);
    this.isConnected = false;
  };

  disconnectServer() {
    if (this.socketClient) {
      this.socketClient.close();
      console.log(`Desconectado del servidor ${this.host}:${this.port}`);
      this.isConnected = false;
    }
  }

  listenLogs(callback) {
    if (!this.isConnected) {
      setTimeout(() => this.listenLogs(callback), 500);
      return;
    }

    console.log("Ahora yo escucho");
    this.socketClient.onmessage = (event) => {
      const dataParsed = event.data;
      console.log(`Mensaje recibido: ${dataParsed}`);
      callback(JSON.parse(dataParsed));
    };
  }

  log({ data, typeLog, module }) {
    if (!this.isConnected) {
      setTimeout(() => this.log({ data, typeLog, module }), 500);
      return;
    }

    try {
      const OBJ_PARSED = JSON.stringify({
        date: new Date().toISOString(),
        module,
        log: data,
        typeLog,
      });

      const stringSend = `init^${
        typeLog === "debug" ? "ns" : "sv"
      }^${OBJ_PARSED}^fin`;

      this.socketClient.send(stringSend);
      console.log(`Se envió la información al servidor: ${stringSend}`);
    } catch (error) {
      console.error(`No se logró enviar el LOG: ${error.message}`);
    }
  }
}
