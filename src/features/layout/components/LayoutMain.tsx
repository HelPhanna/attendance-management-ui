import { Outlet } from "react-router-dom";
import Footer from "@shared/components/Footer";
import Navbar from "@shared/components/Navbar";

const LayoutMain = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default LayoutMain;
