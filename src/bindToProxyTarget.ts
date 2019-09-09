import { ProxyResult } from "./ProxyResult";
import { ArgumentsType } from "./ArgumentsType";
import { FunctionPropertyNames } from "./FunctionPropertyNames";
import { prepareErrorForSerialization } from "./prepareErrorForSerialization";
import { Connection } from "./Connection";
import { functionIdentifier } from "./functionIdentifier";

export const bindToProxyTarget = <T>(
  target: T,
  connection: Connection
) => async (
  callId: string,
  propKey: FunctionPropertyNames<T>,
  ...remainingArgs: ArgumentsType<T[FunctionPropertyNames<T>]>
) => {
  const ff = target[propKey] as any;
  let pr: ProxyResult<any>;
  try {
    const funcArgs = remainingArgs as any[];
    const mappedFuncArgs=funcArgs.map(a => {
      if (typeof a === "object" && a.type === functionIdentifier) {
        return (...args: any[]) => {
          connection.send({ type: "call", id: a.key, result: args });
        };
      }
      return a;
    });
    pr = { type: "return", id: callId, result: await ff(...mappedFuncArgs) };
  } catch (err) {
    pr = {
      type: "return",
      id: callId,
      error: prepareErrorForSerialization(err)
    };
  }
  connection.send(pr);
};
