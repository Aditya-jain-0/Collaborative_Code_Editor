import React, { useState, useEffect } from 'react';

const Chat = ({ socketRef, roomId, curr_user }) => {
    const [msg, setmsg] = useState("");

    useEffect(()=>{
       if(socketRef.current){
           socketRef.current.on('receive-message', ({ username,msg}) => {
               if (msg != "") {
                   displaymessage(username.current,msg);
               }
           });
       } 

       return ()=>{
            socketRef.current.off('receive-message')
       }

    },[socketRef.current])

    const sendmsg = () => {
        displaymessage(curr_user.current,msg)
        if (socketRef && msg) {
            socketRef.current.emit('send-message', { curr_user,msg })
        }
    }

    function displaymessage(username,message) {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${username}</strong>: ${message}`;
        document.getElementById('chats').appendChild(div);
        setmsg("");
    }

    return (
        <>
            <div className='chatarea'>
                <div id='chats'></div><br />
            </div>
            <input
                type='text'
                className='sendmsgbox'
                placeholder='Enter a message'
                value={msg}
                onChange={(e) => setmsg(e.target.value)}
            />
            <button className='sendmsgbtn' onClick={sendmsg}>Send</button>
        </>
    );
}

export default Chat;


