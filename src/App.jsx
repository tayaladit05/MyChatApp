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
  const tokenA="04AAAAAGieK38ADKrUJACiDtHaK/RPmgCvLTbMCwHf2lSWrF5uyhnnMxVe9Sozv1HE3MTS071GOzBiyT7Pt7nSiiovWWoAmNyTvOJhY78xqwN11LEXQTdLkVQXFBzYrluWGsWCjPIvNayLfye8o0EAzDF5Q/gX69Vdcz9DghvK9ma7ORREu3DN8QBOaY52Pcr7sNLWLi1FS8gIhIJ/QSlMgOjSIcc/8swZ1l1RJDaBxWy15B7lF0KAqaYoe4RcPTS1N1TOVDZt1wE="
  const tokenB="04AAAAAGieK8MADCKhYczSQgNv6Wp/GACuJCmLRPz2zZZA/2rc+fiGwS2BVzA7zjn8uPV+u28ZGFyAR67PeXfJE0EvOIC433RfGitBt0YaOmb5BHTjbDYRzDgcVT63SehRwhzrmc61rQ50ZEBLkWR5gZtleLHFRpW4tzt1FRnqlYbh2g2gP0JSNlIY7sQkX4ij/BCm4lD2cbFKXFf2oWCC7ZTO9RMObMhLIUr46IHWj9insucVFZ2Oh0Y9IYIkjHdXgXuUknTRAQ=="
  useEffect(()=>{
    const instance=ZIM.create(AppId)
    setZimInstance(instance)

    instance.on('error', function (zim, errorInfo) {
    console.log('error', errorInfo.code, errorInfo.message);
});
instance.on('connectionStateChanged', function (zim, { state, event}) {
    console.log('connectionStateChanged', state, event);
    if (state === 2) { // Connected
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
    // You can call the renewToken method to renew the token. 
    // To generate a new Token, refer to the Prerequisites.
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

const toConversationID = selectedUser=="Adit"?"Dev":"Adit"; // Peer user's ID.
const conversationType = 0; // Message type; One-to-one chat: 0, in-room chat: 1, group chat:2 
const config = { 
    priority: 1,
  };
const messageTextObj = {
   type: 1,
    message: messageText };
    console.log('Sending message to:', toConversationID, messageTextObj);
    zimInstance.sendMessage(messageTextObj, toConversationID, conversationType, config)
    .then(function ({ message }) {
        // Message sent successfully.
        console.log('Message sent successfully:', message);
        setmessages(prev=>[...prev,message])
    })
    .catch(function (err) {
        // Failed to send a message.
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
          <h1>Real Time Chat App</h1>
          
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
                onClick={() => setisLoggedIn(false)}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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