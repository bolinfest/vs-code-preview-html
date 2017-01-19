# vs-code-preview-html

This is a demo to see what is possible with respect to extending VS Code with
custom UI. This is a simple extension that inserts custom UI in an editor pane
by doing the following:

* Starts a `WebSocketServer` on an ephemeral port when the extension is activated.
* Once the server is initialized, the extension finds out which port is being used
and creates a [`TextDocumentContentProvider`](https://code.visualstudio.com/Docs/extensionAPI/vscode-api#TextDocumentContentProvider)
that returns custom HTML with the port number embedded in it.
* We call `vscode.previewHtml` with a URI that is associated with our
`TextDocumentContentProvider`.
* An embedded pane is loaded with our HTML, which loads some JavaScript that
creates a new `WebSocket` that connects to the `WebSocketServer`.

Once this connection is established, the unprivileged, embedded pane can make
requests to the privileged extension host. Using this mechanism, it seems like
we can define a protocol on this channel that enables RPCs, registering
subscriptions, etc.

## Notable Drawbacks

* The only place we can add UI to VS Code is in one of these editor panes.
We cannot, for example, add a pane to the bottom of the window like the debug
console or a dialog like the command palette.
* Although sandboxing my UI should make VS Code overall more performant, it is
certainly inconvenient being unable to share memory between the extension host
and the embedded pane. All data must be serialized/deserialized between the two.
* I could not develop this extension using [Flow](https://flowtype.org/). I
wasn't keen to use TypeScript, so I ended up sticking to raw JavaScript.
