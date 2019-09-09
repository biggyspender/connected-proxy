import { getProxyForConnection } from "./getProxyForConnection";
import { Connection } from "./Connection";
import { Service } from "./worker/Service";

const delay = ms => new Promise(r => setTimeout(() => r(), ms));

async function init() {
  const { proxy } = await createWorkerProxy<Service>();

  proxy.callMeBack(function(message:string) {
    console.log("yo "+message);
  });
  // for (;;) {
  //   const result = await proxy.sayHello("chris");
  //   console.log(result);
  //   await delay(100);
  // }
}

init();
async function createWorkerProxy<T extends object>() {
  const worker = await createWorker();
  const pgConnection: Connection = createConnection(worker);
  const serviceProxy = getProxyForConnection<T>(pgConnection);
  return { proxy: serviceProxy };
}

function createConnection(worker: Worker): Connection {
  return {
    send(...args: any[]) {
      worker.postMessage(args, undefined);
    },
    onMessage(handler: (...args: any[]) => void) {
      worker.addEventListener("message", evt => {
        handler(...evt.data);
      });
    }
  };
}

async function createWorker() {
  const worker = new Worker("worker/RemoteWorker.ts");
  const workerReadyPromise = new Promise((resolve, reject) => {
    worker.addEventListener("message", function h(evt) {
      worker.removeEventListener("message", h);
      if (evt.data === "ready") {
        resolve();
      } else {
        reject(Error("unexpected"));
      }
    });
  });
  await workerReadyPromise;
  return worker;
}
