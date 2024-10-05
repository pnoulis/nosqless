import { MongoClient, MongoCursorExhaustedError } from "mongodb";
import { EventEmitter } from "node:events";

class QueryBuilder extends EventEmitter {
  #mongo;
  constructor(mongoClient, collection, queryId) {
    super();
    this.#mongo = mongoClient.collection(collection);
    this.collection = collection;
    this.id = queryId || collection;
    this.commands = {
      project: {},
      sort: {},
      limit: 0,
      chunk: 0,
      filter: [],
      query: [],
      pipe: [],
      transform: [],
    };
  }
  query(query) {
    this.commands.query.push(query);
    return this;
  }
  filter(filter) {
    this.commands.filter.push(filter);
    return this;
  }
  chunk(chunk) {
    this.commands.chunk = chunk || 0;
    return this;
  }
  // 1 ascending, -1 descending
  // time: -1 (present -> past), 1 (past -> present)
  sort(field, order) {
    this.commands.sort = {
      [field]: order,
      ...this.commands.sort,
    };
    return this;
  }
  project(...fields) {
    for (let i = 0; i < fields.length; i++) {
      this.commands.project[fields[i]] = 1;
    }
    return this;
  }
  limit(limit) {
    this.commands.limit = limit || 0;
    return this;
  }
  pipe(query) {
    this.commands.pipe.push(query);
    return this;
  }
  makeContext(context) {
    return (data) => {
      context[this.id] = data;
      return context;
    };
  }
  dispatch(i, next, pchunking) {
    const pipe = this.commands.pipe[i];
    let chunking;
    return (context, id, child_chunking) => {
      if (pipe) {
        if (pchunking || child_chunking) {
          console.log(`chunking_${this.id}: ${!!pchunking}`);
          console.log(`chunking_${id}: ${!!child_chunking}`);
          this.chunking = true;
          return pipe
            .start(context, this.dispatch(i + 1, next))
            .then(() => next(context, this.id, child_chunking));
        } else {
          return pipe.start(context, this.dispatch(i + 1, next));
        }
      } else {
        console.log(`pipe_${this.id}: done`);
        return Promise.resolve(context).then(() =>
          next?.(context, this.id, pchunking),
        );
      }
    };
  }
  transform(transform) {
    this.commands.transform.push(transform);
    return this;
  }
  start(context, next) {
    return new Promise(async (resolve, reject) => {
      // data could be coming from either a pipe or the user.

      context ||= {};
      if (typeof context === "function") {
        next = context;
        context = {};
      }

      // construct the query
      let query = {};
      for (let i = 0; i < this.commands.query.length; i++) {
        query = {
          ...query,
          ...(typeof this.commands.query[i] === "function"
            ? this.commands.query[i](context)
            : this.commands.query[i]),
        };
      }

      this.emit(
        "msg",
        `${this.id}: this.#mongo.find(${JSON.stringify(query)})
.project(${JSON.stringify(this.commands.project)})
.limit(${this.commands.limit})
.sort(${JSON.stringify(this.commands.sort)})`,
      );

      const cursor = this.#mongo
        .find(query)
        .project(this.commands.project)
        .limit(this.commands.limit)
        .sort(this.commands.sort);

      try {
        var chunks = [];
        if (this.commands.chunk <= 0) {
          this.emit("msg", `${this.id}: no stream`);
          /* No stream */
          await cursor
            .toArray()
            .then(this.makeContext(context))
            .then(() => this.dispatch(0, next, false)(context, this.id));
        } else if (this.commands.chunk === 1) {
          this.emit("msg", `${this.id}: stream 1 by 1`);
          // Stream 1 by 1
          for await (const document of cursor) {
            await this.dispatch(
              0,
              next,
            )(this.makeContext(context)(document)).then(next);
          }
        } else {
          /* Stream in chunks */
          this.emit("msg", `${this.id}: stream in chunks`);
          while (await cursor.hasNext()) {
            console.log(`chunk: ${this.id}`);
            for (let i = 0; i < this.commands.chunk; i++) {
              chunks.push(await cursor.next());
            }
            await this.dispatch(
              0,
              next,
              true,
            )(this.makeContext(context)(chunks), this.id);
            chunks = [];
          }
        }
      } catch (err) {
        if (!(err instanceof MongoCursorExhaustedError)) reject(err);
        if (chunks.at(-1) ? chunks : chunks.splice(0, -1).length) {
          await this.dispatch(0, next)(
            this.makeContext(context)(chunks),
            this.id,
          );
        }
      } finally {
        this.emit("msg", `closing: ${this.id}`);
        await cursor.close();
        resolve(context);
      }
    });
  }
}

export { QueryBuilder };
