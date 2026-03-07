import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../common/Footer'
import Navbar from '../common/Navbar'

const LayoutMain = () => {
  return (
    <>
    <Navbar/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default LayoutMain