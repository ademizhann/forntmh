import React from "react"; 
import BackgroundImages from "../components/BackgroundImages"; 
import Tips from "../components/Tips";
import AiMain from "../components/AiMain" ;
import TextMain from "../components/TextMain" ;
import Reviews from "../components/Reviews" ;
import LoginModal from "../components/LoginModal" ;
import ContactUs from "../components/ContactUs" ;
import MainCatalog from "../components/MainCatalog" ;


const HomePage = () => {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>

      <BackgroundImages /> 
      <AiMain/>
      <Tips/> 
      <TextMain/> 
      <Reviews/> 
      <MainCatalog/>
      <LoginModal/>
      <ContactUs/>
      
   

      
    </div>
  );
};

export default HomePage;