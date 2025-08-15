import { useState } from 'react'
import './Chat.css'
import EmojiPicer from 'emoji-picker-react'
const Chat = () => {
  const [open , setOpen] = useState(false)
  const [text , setText] = useState("")
  const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji.emoji);
    setOpen(false);
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src="/avatar.png" alt="" />
          <div className="texts">
            <span>User Name</span>
            <p>Last message...</p>
          </div>
        </div>
        <div className="icons">
          <img src="/phone.png" alt="" />
          <img src="/video.png" alt="" />
          <img src="/info.png" alt="" />
        </div>
      </div>
      <div className="center">
        <div className="message ">
        <img src="/avatar.png" alt="" />
        <div className="texts">
          <img src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea doloremque, excepturi officiis repellendus sapiente odio eius autem modi quidem sed, ipsa id. Eum, veniam blanditiis facere labore necessitatibus accusamus doloremque!</p>
          <span>1 munit ago</span>
        </div>
      </div>
      <div className="message own">
        <img src="/avatar.png" alt="" />
        <div className="texts">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea doloremque, excepturi officiis repellendus sapiente odio eius autem modi quidem sed, ipsa id. Eum, veniam blanditiis facere labore necessitatibus accusamus doloremque!</p>
          <span>one munit ago</span>
        </div>
      </div>
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="img.png" alt="" />
          <img src="camera.png" alt="" />
          <img src="mic.png" alt="" />
        </div>
        <input className='input' type="text" placeholder='Type a message...' 
        value={text}
        onChange={(e) => setText(e.target.value)} />
        <div className="emoji">
          <img src="/emoji.png" alt="" onClick={() => setOpen(!open)} />
          <div className="picker">
            {open && <EmojiPicer open={open}  onEmojiClick={(emoji) => {
            handleEmojiClick(emoji);
          }} />}
          </div>
        </div>
        <button className='sendButton'>Send</button>
      </div>
    </div>
  )
}

export default Chat