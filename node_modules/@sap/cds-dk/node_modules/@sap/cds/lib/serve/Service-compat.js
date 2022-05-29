
// Compatibility with srv.emit() used for sync events...

const sync_events = {
  CREATE: 1,
  READ: 1,
  UPDATE: 1,
  DELETE: 1,
  INSERT: 1,
  GET: 1,
  PUT: 1,
  POST: 1,
  PATCH: 1,
  BEGIN: 1,
  COMMIT: 1,
  ROLLBACK: 1,
}

const sync_emit = (srv, req) => {
  // eslint-disable-next-line no-console
  console.trace(`\n
    [Deprecated] - srv.emit() used to send synchronous '${req.event}' request.
    Please change this to use srv.send() instead.
  `)
  return srv.dispatch(req)
}

const {cds} = global
module.exports = function (event, data, headers) {
  if (event instanceof cds.Request)
    return sync_emit (this, event)
  if (event in sync_events)
    return sync_emit (this, new cds.Request({ event, data, headers }))
  if ((typeof event === 'object' && event.query) || (event.event || event.method) in sync_events)
    return sync_emit (this, new cds.Request(event))
}
