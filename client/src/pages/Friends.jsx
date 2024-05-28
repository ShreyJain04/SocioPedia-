import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomButton, FriendsCard, TopBar } from "../components";
import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { apiRequest, sendFriendRequest } from "../utils";
import { IoIosArrowBack } from "react-icons/io";

const Friends = () => {
  const { user } = useSelector((state) => state.user);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchFriendRequest();
    fetchSuggestedFriends();
  }, []);

  const fetchFriendRequest = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST",
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });
      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFriendRequest = async (id) => {
    try {
      const res = await sendFriendRequest(user.token, id);
      await fetchSuggestedFriends();
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request/",
        token: user?.token,
        method: "POST",
        data: { rid: id, status },
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-1 flex-col items-center justify-center px-4 lg:px-10 pb-20 2xl:px-40 overflow-y-auto">
        {/* PROFILE CARD */}
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-center justify-center lg:items-start lg:justify-between mt-6">
          <div className="w-full lg:w-1/3 bg-primary shadow-sm rounded-lg p-6">
            <FriendsCard friends={user?.friends} />
          </div>

          {/* FRIEND REQUEST */}
          <div className="w-full lg:w-1/3 bg-primary shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#B4B4B8]">
              <span> Friend Request</span>
              <span>{friendRequest?.length}</span>
            </div>

            <div className="w-full flex flex-col gap-4 pt-4">
              {friendRequest?.map(({ _id, requestFrom: from }) => (
                <div key={_id} className="flex items-center justify-between">
                  <Link
                    to={"/profile/" + from._id}
                    className="w-full flex gap-4 items-center cursor-pointer"
                  >
                    <img
                      src={from?.profileUrl ?? NoProfile}
                      alt={from?.firstName}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-base font-medium text-ascent-1">
                        {from?.firstName} {from?.lastName}
                      </p>
                      <span className="text-sm text-ascent-2">
                        {from?.profession ?? "No Profession"}
                      </span>
                    </div>
                  </Link>

                  <div className="flex gap-1">
                    <CustomButton
                      title="Accept"
                      onClick={() => acceptFriendRequest(_id, "Accepted")}
                      containerStyles="bg-[#87A922] text-xs text-white px-1.5 py-1 rounded-full"
                    />
                    <CustomButton
                      title="Deny"
                      onClick={() => acceptFriendRequest(_id, "Denied")}
                      containerStyles="border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUGGESTED FRIENDS */}
          <div className="w-full lg:w-1/3 bg-primary shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between text-lg text-ascent-1 pb-2 border-b border-[#B4B4B8]">
              <span>Friend Suggestion</span>
            </div>
            <div className="w-full flex flex-col gap-4 pt-4">
              {suggestedFriends?.map((friend) => (
                <div
                  className="flex items-center justify-between"
                  key={friend._id}
                >
                  <Link
                    to={"/profile/" + friend?._id}
                    key={friend?._id}
                    className="w-full flex gap-4 items-center cursor-pointer"
                  >
                    <img
                      src={friend?.profileUrl ?? NoProfile}
                      alt={friend?.firstName}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-base font-medium text-ascent-1">
                        {friend?.firstName} {friend?.lastName}
                      </p>
                      <span className="text-sm text-ascent-2">
                        {friend?.profession ?? "No Profession"}
                      </span>
                    </div>
                  </Link>

                  <div className="flex gap-1">
                    <button
                      className="bg-[#DCFFB7] text-sm text-white p-1 rounded"
                      onClick={() => handleFriendRequest(friend?._id)}
                    >
                      <BsPersonFillAdd size={20} className="text-[#87A922]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
