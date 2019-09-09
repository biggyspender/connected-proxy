import { Connection } from "./Connection";
import { ProxyResult } from "./ProxyResult";
import { v4 as uuid } from "uuid";
import { functionIdentifier } from "./functionIdentifier";

interface PromiseResolver {
  resolve: Function;
  reject: Function;
}
const proxyMap = new Map<Connection, any>();
export const getProxyForConnection = <T extends object>(
  connection: Connection
): T => {
  const proxy = proxyMap.get(connection);
  if (proxy) {
    return proxy;
  }
  const newProxy = getProxyForConnectionInternal<T>(connection);
  proxyMap.set(connection, newProxy);
  return newProxy;
};

const getProxyForConnectionInternal = <T extends object>(
  connection: Connection
): T => {
  let callId = 0;
  const returnMap = new Map<string, PromiseResolver>();
  const functionMap = new Map<string, (...args: any[]) => void>();

  const uniqueKey = uuid();
  const handler: ProxyHandler<T> = {
    get: (_, propKey) => (...args: any[]) => {
      const thisCallId = `${uniqueKey} : ${callId++}`;
      const mappedArgs = args.map(a => {
        if (typeof a === "function") {
          const funcKey = uuid();
          functionMap.set(funcKey, a);
          return { type: functionIdentifier, key: funcKey };
        }
        return a;
      });
      //console.log(thisCallId, propKey, ...args);
      connection.send(thisCallId, propKey, ...mappedArgs);
      return new Promise((resolve, reject) => {
        returnMap.set(thisCallId, { resolve, reject });
      });
    }
  };
  connection.onMessage(
    ({ type, id, result, error }: ProxyResult<any>) => {
      if (type === "return") {
        const resolver = returnMap.get(id);

        if (resolver) {
          if (error) {
            resolver.reject(error);
          } else {
            resolver.resolve(result);
          }
          returnMap.delete(id);
        } else {
          console.log(`could not find callId ${id} in returnMap`);
          return;
        }
      }else if(type==="call"){
        const f=functionMap.get(id);
        f(...result);
      }
    }
  );
  const proxy = new Proxy<T>({} as T, handler);
  return proxy;
};
