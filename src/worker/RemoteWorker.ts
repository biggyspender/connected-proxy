import { Connection } from "../Connection";
import { proxyObjectToConnection } from "../proxyObjectToConnection";
import { Service } from "./Service";

let i = 0;
const service: Service = {
  async sayHello(name: string) {
    return "hello " + name + i++;
  },
  async callMeBack(cb) {
    let ii = 0;
    setInterval(() => cb("hello" + ii++), 1000);
  }
};

const workerConnection: Connection = {
  onMessage(handler: (...args: any[]) => void) {
    self.addEventListener("message", evt => handler(...evt.data));
  },
  send(...args: any[]) {
    self.postMessage(args, undefined);
  }
};

proxyObjectToConnection(service, workerConnection);
self.postMessage("ready", undefined);
