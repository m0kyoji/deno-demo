interface MessageAreaProps {
  messages: string[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: (type: 'chat' | 'object', data: string | object) => void;
}

export function MessageArea({ messages, input, setInput, sendMessage }: MessageAreaProps) {
  return (
      <div style={{
        position: "fixed",
        flexDirection: "column",
        display: "flex",
        top: 0,
        right: 0,
        bottom: 0,
        width: "320px",
        borderLeft: "1px solid #ccc" }}>
        <div style={{
          flex: 1,
          padding: "16px",
          overflowY: "scroll"
        }}>
          {messages.map((msg, index) => (
              <div key={index} style={{
                borderBottom: "solid 1px #efefef",
                padding: "8px 0"
              }}>
                {msg}
              </div>
          ))}
        </div>
        <div>
          <textarea
              type="text"
              value={ input }
              onChange={ (e) => setInput(e.currentTarget.value) }
              placeholder="メッセージを入力..."
          />
          <button onClick={ () => sendMessage('chat', input) }>送信</button>
        </div>
      </div>
  );
}
