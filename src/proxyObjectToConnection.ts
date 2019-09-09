import { bindToProxyTarget } from "./bindToProxyTarget";
import { Connection } from "./Connection";

export const proxyObjectToConnection = <T>(
  target: T,
  connection: Connection
): void => {
  const boundTarget = bindToProxyTarget(target, connection);
  connection.onMessage(boundTarget);
};
