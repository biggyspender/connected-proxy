export interface Service {
  sayHello(name: string): Promise<string>;
  callMeBack(cb: (msg:string) => void): Promise<void>;
}
