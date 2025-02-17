
export default function Chat() {

  const generateRoom = () => {
    const newRoomId = crypto.randomUUID().slice(0, 32);
    globalThis.location.href = `/rooms/${newRoomId}`;
  };

  return (
      <div>
        <button onClick={ generateRoom }>新しいルームを作成</button>
      </div>
  )
}