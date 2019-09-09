export interface Connection {
  send(...args: any[]);
  onMessage(handler: (...args: any[]) => void);
}
