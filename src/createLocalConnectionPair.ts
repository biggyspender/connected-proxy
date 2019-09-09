import { Connection } from "./Connection";

export interface LocalConnection extends Connection {
  dispatch(data: string);
}
interface Serializer {
  serialize<T>(obj: T): string;
  deserialize<T>(msg: string): T;
}
const serializer: Serializer = {
  serialize(obj) {
    return JSON.stringify(obj);
  },
  deserialize(val) {
    return JSON.parse(val);
  }
};
export const createConnectionPair = (): [Connection, Connection] => {
  const c1: LocalConnection = createConnection();
  const c2: LocalConnection = createConnection();
  c1.send = (...args: any[]) => {
    setTimeout(() => {
      c2.dispatch(serializer.serialize(args));
    }, 1000);
  };
  c2.send = (...args: any[]) => {
    setTimeout(() => {
      c1.dispatch(serializer.serialize(args));
    }, 1000);
  };
  return [c1, c2];
};
function createConnection() {
  const handlers: Array<(...args: any[]) => void> = [];
  var c1: LocalConnection = {
    send(...args: any[]) {},
    dispatch(data: string) {
      handlers.forEach(h => {
        console.log(data);
        h(...serializer.deserialize<any[]>(data));
      });
    },
    onMessage(handler: (...args: any[]) => void) {
      handlers.push(handler);
    }
  };
  return c1;
}
