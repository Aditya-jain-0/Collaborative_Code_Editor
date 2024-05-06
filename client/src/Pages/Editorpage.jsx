import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import Chat from '../components/Chat'
import { initSocket } from '../socket'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null)
  const location = useLocation();
  const reactnavigate = useNavigate();
  const { roomId } = useParams()
  const [clients, setClients] = useState([])
  const [opt, setopt] = useState("")
  const [inp, setinp] = useState("")
  const userref = useRef("");

  const clroptscreen = () => { setopt("") }

  if (location.state?.username) {
    userref.current = location.state.username;
  }

  const runcodefn = async () => {
    socketRef.current.emit('compile-code', {
      code: codeRef.current,
      input: inp
    })
    socketRef.current.on('compile-code', ({ outpt }) => {
      if (outpt) {
        setopt(outpt);
      } else {
        setopt("Error")
      }
    })
  }

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log(e);
        toast.error('Socket Connection Failed')
        reactnavigate("/")
      }

      socketRef.current.emit('join', {
        roomId,
        username: location.state?.username    // '?' prevent error if username not found  //N
      })

      socketRef.current.on('joined', ({ clients, username, socketId }) => {
        if (username !== location.state.username) {
          //new joinee alert to all sockets except the current user 
          toast.success(`${username} joined`)
          console.log(`${username} joined`)
        }
        setClients(clients)
        socketRef.current.emit('sync-code', {
          code: codeRef.current,
          socketId,
        })
      })

      socketRef.current.on('disconnected', ({ socketId, username }) => {
        if (username) {
          toast.success(`${username} Left`)
        }
        //removal of disconnected client from client component     //N
        setClients((prev) => {
          return prev.filter(
            (client) => client.socketId !== socketId
          );
        })
      })

    }

    init()
    //remove listerners called when component unmounted
    return () => {
      socketRef.current.disconnect()
      socketRef.current.off('join')
      socketRef.current.off('disconnected')
    }

  }, [])

  const copyroomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success('RoomId Copied!')
    } catch (error) {
      console.log(error)
      toast.error('Error while Copying ')
    }
  }

  const leaveroom = () => {
    reactnavigate('/')
  }

  if (!location.state) {
    return <Navigate to="/" />
  }


  return (
    <div className='mainWrap'>
      <div className='left-container'>
        <div className='memWrap'>
          <div className='memWrapinner'>
            <h3 className='EditorHeading'>Collaborators</h3>
            <div className='memList'>
              <h3 className='currentuser'>{userref.current}</h3>
              {clients.map((client) => (
                client.username!== userref.current &&
                <Client
                  key={client.socketId}
                  username={client.username}
                />
              ))}
            </div>
          </div>
        </div>
        <div className='editorWrap'>
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
        <div className='input-output-area'>
          <div className='input-area'>
            <h4>Input :- </h4>
            <textarea value={inp} onChange={(e) => setinp(e.target.value)}></textarea>
          </div>
          <div className='output-area'>
            <h4>Output :- </h4>
            <div className='output'>{opt}</div>
            <button className='clrbtn' onClick={clroptscreen}>Clear</button>
          </div>
        </div>
      </div>
      <div className='right-container'>
        <div>
          <div className='chatsection'>
            <Chat
              socketRef={socketRef}
              roomId={roomId}
              curr_user={userref}
            />
          </div>
        </div>
        <div className='memWrapbtn'>
          <button onClick={copyroomId}>Copy room Id</button>
          <button onClick={leaveroom}>Leave</button>
          <button className='runbtn' onClick={runcodefn}>Run</button>
        </div>
      </div>
    </div>
  )
}

export default EditorPage