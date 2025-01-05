import React from 'react'

export default function Header() {
  return (
       <header className='flex item-center justify-between gap-4 p-4 '>
                  
                   < a href='/'> <h1 className='font-medium'>Global<span className='text-blue-400 bold'>Speak</span></h1> </a>
                   <a href='/' className='flex item-center gap-2 specialBtn px-4 py-2 rounded-lg text-blue-400 text-sm'>
                     <p>New</p>
                     <i className='fa-solid fa-plus'></i>
                   </a>
       
       
               </header>
  )
}
