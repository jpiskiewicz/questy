interface InvalidationStreamController {
  stream?: ReadableStream;
  controller?: ReadableStreamDefaultController;
  clients: number;
}

class InvalidationStreams {
  private streams: Map<string, InvalidationStreamController> = new Map();

  create(user: string) {
    if (!this.streams.has(user)) {
      let isc: InvalidationStreamController = { clients: 0 };
      const stream = new ReadableStream({
        start(controller) {
          isc.controller = controller;
        }
      });
      isc.stream = stream;
      this.streams.set(user, isc);
    }
    const streamController = <InvalidationStreamController>this.streams.get(user);
    streamController.clients++;
  }

  invalidate(user: string) {
    const conn = this.streams.get(user)?.controller;
    conn?.enqueue("invalidate");
  }

  delete(user: string) {
    const stream = this.streams.get(user);
    if (stream) {
      if (--stream.clients === 0) {
        stream.controller?.close();
        this.streams.delete(user);
      }
    }
  }

  getUserStream(user: string): ReadableStream | null {
    const s = this.streams.get(user);
    if (s) {
      const [s1, s2] = s.stream!.tee();
      s.stream = s1;
      return s2;
    }
    return null;
  }
}

export default InvalidationStreams;
