import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, User } from "lucide-react";

import { Typography } from "../../atom/typography";
import Modal from "../../molecule/modal";
import { useModal } from "../../../hooks/useModal";

import axiosInstance from "../../../utils/instance";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isModalOpen, openModal, closeModal } = useModal();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = user.name || "Admin";

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleConfirmLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/users/logout");

      if (response.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("id");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="lg:fixed lg:top-0 lg:left-48 lg:w-[calc(100%-12rem)] flex items-center lg:px-10 lg:py-4 lg:bg-typo-white2 lg:border-b border-b-typo-outline lg:shadow-md lg:z-10">
      <div className="flex-grow" />
      <div ref={dropdownRef} className="relative flex items-center gap-2 pr-6">
        <User className="w-10 h-10 text-white rounded-full bg-primary p-1" />
        <div onClick={toggleDropdown} className="flex items-center gap-1 cursor-pointer">
          <Typography type="body" weight="semibold" className="hidden md:block">{adminName}</Typography>
          {isDropdownOpen ? <ChevronUp /> : <ChevronDown />}
        </div>

        {isDropdownOpen && (
          <div className="absolute top-9 right-4 w-36 border bg-white shadow-md z-10 rounded-lg overflow-hidden">
            <button
              className="block w-full text-left text-sm px-3 py-2 rounded-sm transition-all hover:bg-typo-outline"
              onClick={() => {
                navigate("/admin/profile");
                setIsDropdownOpen(false);
              }}
            >
              <Typography
                type="body"
                font="dm-sans"
                weight="regular"
                className="text-typo"
              >
                Profile
              </Typography>
            </button>
            <button
              className="block w-full text-left text-sm px-3 py-2 rounded-sm transition-all hover:bg-typo-outline"
              onClick={() => {
                openModal();
                setIsDropdownOpen(false);
              }}
            >
              <Typography
                type="body"
                font="dm-sans"
                weight="regular"
                className="text-primary"
              >
                Logout
              </Typography>
            </button>
          </div>
        )}
      </div>

      <Modal
        sizeClass="md:w-1/4 w-full"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin logout?"
      />
    </header>
  );
};

export default Header;