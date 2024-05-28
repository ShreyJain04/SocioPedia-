import React from "react";
import { TbSocial } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import { IoMdNotificationsOutline } from "react-icons/io";
import { SetTheme } from "../redux/theme";
import { Logout } from "../redux/userSlice";
import { fetchPosts } from "../utils";
import img from "../assets/Socio2.png";
import { FaMoon } from "react-icons/fa";
import { FaSun } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";

const TopBar = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Moved outside of the nested function
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";
    dispatch(SetTheme(themeValue));
  };

  const handleSearch = async (data) => {
    await fetchPosts(user.token, dispatch, "", data);
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const handleFriends = ()=>{
    navigate('/friends');
  }

  return (
    <div className="topbar w-full flex items-center justify-between py-3 md:py-6 px-4 bg-primary">
      <Link to="/" className="flex gap-2 items-center">
        <img src={img} className=" h-10 w-10 rounded-3xl" alt="SocioPedia Logo" />
        <span className="text-xl md:text-2xl text-[#87A922] font-semibold">
          SocioPedia
        </span>
      </Link>
      <IoIosArrowBack size={25} onClick={handleBackHome} color={theme==="light"? "black": "white"}/>

      <form
        className="hidden md:flex items-center justify-center"
        onSubmit={handleSubmit(handleSearch)}
      >
        <TextInput
          placeholder="🔍Search..."
          styles="w-[18rem] lg:w-[38rem] rounded-l-full py-3"
          register={register("search")}
        />
        <CustomButton
          title="Search"
          type="submit"
          containerStyles="bg-[#87A922] text-white px-6 py-2.5 mt-2 rounded-r-full"
        />
      </form>

      {/* ICONS */}
      <div className="flex gap-4 items-center text-ascent-1 text-md md:text-xl">
        <button onClick={handleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        <div className="flex">
          <FaUserFriends size={23} onClick={handleFriends} />
        </div>

        <div>
          <CustomButton
            onClick={() => dispatch(Logout())}
            title="Log Out"
            containerStyles="text-sm bg-[#ED2B2A] text-ascent-1 px-2 md:px-4 py-1 md:py-2 border border-[#666] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
