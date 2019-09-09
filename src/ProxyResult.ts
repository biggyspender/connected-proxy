import { ProxyResultType } from "./ProxyResultType";

export interface ProxyResult<T> {
  type: ProxyResultType;
  result?: T;
  id: string;
  error?: any;
}
