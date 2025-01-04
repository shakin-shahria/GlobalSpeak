import { useState,useEffect } from 'react'
import HomePage from './components/HomePage'
import Header from './components/Header'
import FileDisplay from './components/FileDisplay'
import Information from './components/Information'
import Transcribing from './components/Transcribing'

function App() {
 
  const [file,setFile]=useState(null)
  const [audioStream,setAudioStream]=useState(null)
  const [loading,setLoading]=useState(false)
  const [output,setOutput]=useState(null)
  const [finished, setFinished] = useState(false)

  function handleAudioReset(){

    setFile(null)
    setAudioStream(null)
  }



  useEffect(() => {
    console.log(audioStream);
  }, [audioStream]);
  

  const isAudioAvailable = file || audioStream // IN this we are checking the both audio types


  return (
    <div className='flex flex-col max-w-[1000px] mx-auto w-full'>


      <section className='min-h-screen flex flex-col' >
        
        <Header />

        {output ? (
          <Information output={output} finished={finished}/>
        ) : loading ? (
          <Transcribing />
        ) : isAudioAvailable ? (
          <FileDisplay handleFormSubmission={handleFormSubmission} handleAudioReset={handleAudioReset} file={file} audioStream={audioStream} />
        ) : (
          <HomePage setFile={setFile} setAudioStream={setAudioStream} />
        )}

        

      </section>
       
       <h1 className='text-red-200'>Hello</h1>
       <footer>

       </footer>
      
    </div>
  )
}

export default App
