import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import { getUserInfo, postUserInfoforEdit } from "../../api/myPageApi";
import { checkNickname } from "../../api/memberApi";
import { useNavigate } from "react-router-dom";

const initState = {
  firstname: "",
  lastname: "",
  nickName: "",
  email: "",
  phoneNumber1: "",
  phoneNumber2: "",
  phoneNumber3: "",
  birthday: "",
  country: "",
  state: "",
  city: "",
  street: "",
  zipcode: "",
  password: "",
  newPassword: "",
  confirmPassword: "",
};

const EditProfileComponent = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ ...initState });
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getUserInfo().then((data) => {
      setUserInfo(data);
    });
  }, []);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleClickEditProfile = async (e) => {
    e.preventDefault();
    if (!userInfo.newPassword || !userInfo.confirmPassword) {
      alert(
        "Please enter both the new password and the confirmation password."
      );
      return;
    }
    if (userInfo.newPassword !== userInfo.confirmPassword) {
      alert("The new password and confirmation password do not match.");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Submitting user info:", userInfo);
      await postUserInfoforEdit(userInfo);
      alert("Profile edited successfully!");
      setUserInfo({ ...initState });
    } catch (error) {
      console.error("Error occurred during profile editing:", error);
      alert("Failed to edit profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNicknameAvailability = async () => {
    setIsCheckingNickname(true);
    try {
      const response = await checkNickname(userInfo.nickName);
      setIsNicknameAvailable(response.includes("Available Nickname"));
      alert(response);
    } catch (error) {
      console.error("Error checking nickname availability:", error);
      alert("Error checking nickname availability.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-10 space-y-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-gray-700">
          Edit Profile
        </h2>

        {/* Personal Information Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">First Name</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="firstname"
                type="text"
                value={userInfo.firstname}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Last Name</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="lastname"
                type="text"
                value={userInfo.lastname}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="email"
                type="email"
                value={userInfo.email}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Birthday</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="birthday"
                type="text"
                value={userInfo.birthday}
                disabled
              />
            </div>
          </div>
        </section>

        {/* Nickname Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Nickname</h3>
          <div className="flex items-center gap-4">
            <input
              className="flex-1 p-3 border border-gray-300 rounded"
              name="nickName"
              type="text"
              value={userInfo.nickName}
              onChange={handleChange}
            />
            <Button
              className="p-3 bg-stone-400 text-white rounded-lg"
              onClick={checkNicknameAvailability}
            >
              Check
            </Button>
          </div>
        </section>

        {/* Address Section */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">Country</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="country"
                type="text"
                value={userInfo.country}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">State</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="state"
                type="text"
                value={userInfo.state}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">City</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="city"
                type="text"
                value={userInfo.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Street</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="street"
                type="text"
                value={userInfo.street}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Zipcode</label>
              <input
                className="w-full p-3 border border-gray-300 rounded"
                name="zipcode"
                type="text"
                value={userInfo.zipcode}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Password Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Change Password
          </h3>
          <div>
            <label className="block text-gray-600 mb-1">New Password</label>
            <input
              className="w-full p-3 border border-gray-300 rounded"
              name="newPassword"
              type="password"
              value={userInfo.newPassword}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded"
              name="confirmPassword"
              type="password"
              value={userInfo.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button
            className="w-full py-3 bg-stone-400 text-white rounded-lg"
            onClick={handleClickEditProfile}
          >
            Save Changes
          </Button>
          <Button
            className="w-full py-3 bg-gray-500 text-white rounded-lg"
            onClick={() => navigate("/mypage")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileComponent;
