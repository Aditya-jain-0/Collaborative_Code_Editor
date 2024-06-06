import React, { useEffect, useRef } from 'react'
import Codemirror, { changeEnd } from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/python/python'
import 'codemirror/theme/material-ocean.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'

const Editor = ({socketRef,roomId,onCodeChange}) => {

  const editorRef = useRef(null);

  useEffect(()=>{
    async function init(){
      editorRef.current =  Codemirror.fromTextArea(document.getElementById('rteditor'),{
        mode:{name:'python',json:true},
        // theme:'material-ocean',
        autoCloseTags:true,
        autoCloseBrackets:true,
        lineNumbers:true
      });

      // 'change' codemirror event 
      editorRef.current.on('change',(instance,changes)=>{
          // console.log('changes ',changes)  // input from our side
          const {origin} = changes
          const code = instance.getValue();   //editor content 
          onCodeChange(code)
          if(origin!=='setValue'){
            //reflecting code to other connected clientsx
            socketRef.current.emit('code-change',{
              roomId,
              code
            })
          }

          // console.log(code)
      })
    }
    init()
  },[])

  useEffect(()=>{   //E
  if(socketRef.current){
    socketRef.current.on('code-change',({code,username})=>{
      if(code!==null){
        editorRef.current.setValue(code)
      }      
    })
  }

  return ()=>{
    socketRef.current.off('code-change')
  }

  },[socketRef.current])

  return (
    <textarea id='rteditor'></textarea>
    // <textarea id='rteditor' rows="35" cols = "125"></textarea>
  )
}

export default Editor