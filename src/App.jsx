import { useState,useEffect } from 'react'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'

function App() {
 
  const [file,setFile]=useState(null)
  const [audionStream,setAudioStream]=useState(null)

  function handleAudioReset(){

    setFile(null)
    setAudioStream(null)
  }


  const isAudioAvailable = file || audionStream // IN this we are checking the both audio types


  return (
    <div className='flex flex-col max-w-[1000px] mx-auto w-full'>


      <section className='min-h-screen flex flex-col' >
        
        <Header />

        {/* If don't have the audio render the HOmePage other wise render the FileDisplay */}

        {isAudioAvailable ? (<FileDisplay file={file} audionStream={audionStream} handleAudioReset={handleAudioReset} />):(<HomePage setFile={setFile} setAudioStream={setAudioStream}  />)}

      </section>
       
       <h1 className='text-red-200'>Hello</h1>
       <footer>

       </footer>
      
    </div>
  )
}

export default App
