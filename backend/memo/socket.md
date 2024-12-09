# Socket.io

## Send

### Server

```
// 1. 特定のクライアントにのみ送信
socket.emit("eventName", data);

// 2. 送信元以外の全クライアントに送信
socket.broadcast.emit("eventName", data);

// 3. 特定のルームの送信元以外のクライアントに送信
socket.to(roomId).emit("eventName", data);

// 4. 特定のルームの全クライアントに送信（送信元含む）
io.to(roomId).emit("eventName", data);

// 5. 全クライアントに送信
io.emit("eventName", data);

// 6. 複数のルームに送信
socket.to([room1, room2]).emit("eventName", data);
```

### Client

```
// 1. サーバーにイベントを送信
socket.emit("eventName", data);

// 2. コールバック付きでイベントを送信
socket.emit("eventName", data, (response) => {
  console.log("Server response:", response);
});
```

## Receive

```
// サーバー側
socket.on("eventName", (data, callback) => {
  console.log("Received:", data);
  // オプションのコールバック
  if (callback) {
    callback({ status: "ok" });
  }
});

// クライアント側
socket.on("eventName", (data) => {
  console.log("Received:", data);
});
```

## error

```
// サーバー側
socket.on("eventName", async (data) => {
  try {
    // 処理
    socket.emit("success", result);
  } catch (error) {
    socket.emit("error", {
      message: "Operation failed"
    });
  }
});

// クライアント側
socket.on("error", (error) => {
  console.error("Socket error:", error);
});
```

## connect / disconnect

```
// サーバー側
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// クライアント側
socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
```
