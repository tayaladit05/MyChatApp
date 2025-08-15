import React, { useEffect, useState, useRef } from 'react'
import { ZIM } from 'zego-zim-web'
import './App.css';

function App() {
  const [zimInstance,setZimInstance]=useState(null)
  const messageEndRef=useRef(null)
  const[userInfo,setuserInfo]=useState(null)
  const [messageText,setmessageText]=useState("")
  const [messages,setmessages]=useState([])
  const [selectedUser,setselectedUser]=useState("Adit")
  const [isLoggedIn,setisLoggedIn]=useState(false)
  const AppId=1177127459
  const tokenA="04AAAAAGiff8EADH29+fESdemduJEfiwCuv0F8TUrVt3vd/RkIMbI90t1e2fNtaCPX15oVG+4hpGuRnf7nk13dswNxWyJDWuG2TkUgLvrXPXds534XvNtbPKqnLvOJUGYYRz2d4m6Sk8W26xs5WCRVB401ogocxbv9wkn3FRRaLrzMv5cqcse2R5Fc5Gaxj71l9h3NUpQqm1p4OkGIsQkTyCkgGWu6OimR+kpbLH5N6cM/Vhv2QDJhH4maE+9O6WRjqpl3zUENAQ=="
  const tokenB="04AAAAAGiff+EADCbj+ctYXaLumuBOOQCtqUdA4XQHVHuJFUiUpazeB6h8zRHuw3VykCDVQly8Z2QTLdWt9B7bIeWx2vvbGtnM5yvbhegUCI1O3oXGsHE8h65r0U6sWxYr7UAYrvUyyaFB2z5Xy3Dw+gpACGhB8NJScdvgmLYOx7q/H+iQNRLqkfnciJbjQSkFidaCTs1kEpsKb90Eu3+VN9aQjXm21JQyveNwRVzU6IuEI981KoJupgyWW+B9qGnyF5zlkGUB"
  useEffect(()=>{
    const instance=ZIM.create(AppId)
    setZimInstance(instance)

    instance.on('error', function (zim, errorInfo) {
    console.log('error', errorInfo.code, errorInfo.message);
});
instance.on('connectionStateChanged', function (zim, { state, event}) {
    console.log('connectionStateChanged', state, event);
    if (state === 2) { 
        console.log('User is now connected and ready to send/receive messages');
    }
});
instance.on('peerMessageReceived', function (zim, { messageList }) {
   console.log('Received messages:', messageList);
   messageList.forEach(message => {
     setmessages(prev=>[...prev, message]);
   });
});
instance.on('tokenWillExpire', function (zim, { second }) {
    console.log('tokenWillExpire', second);
    zim.renewToken(selectedUser=="Adit"?tokenA:tokenB)
        .then(function(){
            console.log("token renewed")
        })
        .catch(function(err){
            console.log(err)
        })
});
return ()=>{ instance.destroy()}
  },[])




  useEffect(()=>{
    if(messageEndRef.current){
 messageEndRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages])
   
  const handleLogOut=()=>{
    setisLoggedIn(false);
    setuserInfo(null);
    setmessages([]);
    setmessageText("");
    setselectedUser("Adit"); 
    
    if(zimInstance) {
      zimInstance.logout()
        .then(() => {
          console.log("Logged out successfully");
        })
        .catch((err) => {
          console.log("Logout error:", err);
        });
    }
  }





  const handleLogin=()=>{
    const info={userID: selectedUser, userName:selectedUser=="Adit"?"Adit":"Dev"}
    setuserInfo(info)
    const loginToken = selectedUser=="Adit"?tokenA:tokenB
    if(zimInstance){
     
   
    zimInstance.login(info, loginToken)
    .then(function () {
      setisLoggedIn(true)
        console.log("logged in")
    })
    .catch(function (err) {
        console.log("login failed")
    }); }else{
      console.log("instance error")
    }
  }




  const handleSendMessage=()=>
  {
if(!isLoggedIn) return

const toConversationID = selectedUser=="Adit"?"Dev":"Adit"; 
const conversationType = 0;  
const config = { 
    priority: 1,
  };
const messageTextObj = {
   type: 1,
    message: messageText };
    console.log('Sending message to:', toConversationID, messageTextObj);
    zimInstance.sendMessage(messageTextObj, toConversationID, conversationType, config)
    .then(function ({ message }) {
      
        console.log('Message sent successfully:', message);
        setmessages(prev=>[...prev,message])
    })
    .catch(function (err) {
        
        console.log('Failed to send message:', err)
    });
    setmessageText("")

  }



  const formatTime=(timeStamp)=>{
    const date=new Date(timeStamp)
    return date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
  }

  
  
  return (
    <div className="App">
      {!isLoggedIn ? (
        // Login Page
        <div className="login-container">
          <h1>Vamos-A Real Time Chat App</h1>
          
          <select 
            className="user-select" 
            value={selectedUser} 
            onChange={(e) => setselectedUser(e.target.value)}
          >
            <option value="" disabled>Select a user</option>
            <option value="Adit">Adit</option>
            <option value="Dev">Dev</option>
          </select>
          
          <button 
            className="login-button" 
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      ) : (
        // Chat Page
        <div className="chat-container">
          <div className="chat-header">
            <h2>Welcome, {userInfo?.userName}!</h2>
            <div className="chat-info">
              <span>Chatting with: {selectedUser === "Adit" ? "Dev" : "Adit"}</span>
              <button 
                className="logout-button" 
                onClick={handleLogOut}
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="messages-container">
            {messages.map((message, index) => {
              console.log('Rendering message:', message);
              return (
                //conditional styling for right and left side of a message
                <div 
                  key={index} 
                  className={`message ${message.senderUserID === userInfo?.userID ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <span className="message-text">{message.message}</span>
                    <span className="message-time">
                      {message.timestamp ? formatTime(message.timestamp) : 'Now'}
                    </span>
                  </div>
                  <small className="sender-info">
                    {message.senderUserID === userInfo?.userID ? 'You' : message.senderUserID}
                  </small>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
          
          <div className="message-input-container">
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setmessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App