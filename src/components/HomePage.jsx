import React from 'react'

export default function HomePage() {
  return (
    <main className='flex-1 p-4 flex flex-col justify-center gap-3 sm:gap-4 md:gap-5 text-center pd-20'>
       
       <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>Global<span className='text-blue-400'>Speak</span></h1>

       <h3 className='font-medium md:text-lg'>Record <span className='text-blue-400'>&rarr;</span>Transcribe <span className='text-blue-400'>&rarr;</span>Translate </h3>

       <button className='flex items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4 specialBtn px-4 py-2 rounded-xl'>
           
           <p className='text-blue-400'>Record</p>
           <i className='fa-solid fa-microphone'></i>
            

       </button>

       <p className='text-base'>Or <label className='text-blue-400 curson-pointer hover:text-blue-600 duration-200'>upload <input className='hidden' type="file" accept='.mp3, .wave' /></label> a mp3 file</p>

       <p>put whatever you want later</p>





    </main>
  )
}