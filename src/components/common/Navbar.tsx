import React from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../icons";

type TabKey = "attendance" | "reports" | "blacklist";

type NavbarProps = {
  userName?: string;
  userRole?: string;
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
};

export default function Navbar({
  userName = "Synayuth",
  userRole = "Teacher",
  activeTab = "attendance",
  onTabChange,
}: NavbarProps) {
  return (
    <header className="w-full">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-800">
              {/* <svg
                width="25"
                height="25"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.6667 29.3333V24C18.6667 23.2928 18.3858 22.6145 17.8857 22.1144C17.3856 21.6143 16.7073 21.3333 16 21.3333C15.2928 21.3333 14.6145 21.6143 14.1144 22.1144C13.6143 22.6145 13.3334 23.2928 13.3334 24V29.3333"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M24 13.3333L28.596 15.632C28.8174 15.7426 29.0037 15.9128 29.1339 16.1233C29.2641 16.3338 29.3332 16.5764 29.3333 16.824V26.6667C29.3333 27.3739 29.0523 28.0522 28.5522 28.5523C28.0521 29.0524 27.3739 29.3333 26.6666 29.3333H5.33329C4.62605 29.3333 3.94777 29.0524 3.44767 28.5523C2.94758 28.0522 2.66663 27.3739 2.66663 26.6667V16.824C2.66676 16.5764 2.7358 16.3338 2.86603 16.1233C2.99625 15.9128 3.18252 15.7426 3.40396 15.632L7.99996 13.3333"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M24 6.66667V29.3333"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5.33337 8.00001L14.808 3.26267C15.1782 3.07772 15.5863 2.98143 16 2.98143C16.4138 2.98143 16.8219 3.07772 17.192 3.26267L26.6667 8.00001"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 6.66667V29.3333"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 14.6667C17.4728 14.6667 18.6667 13.4728 18.6667 12C18.6667 10.5272 17.4728 9.33333 16 9.33333C14.5273 9.33333 13.3334 10.5272 13.3334 12C13.3334 13.4728 14.5273 14.6667 16 14.6667Z"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg> */}
              <Logo />
            </div>

            <div className="leading-tight ">
              <div className="text-sm font-semibold mb-1">Class Attendance</div>
              <div className="text-[11px] text-slate-300">SETEC Portal v1</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded p-2 text-slate-200 hover:bg-white/10 hover:text-white"
              aria-label="Notifications"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.55664 21.5C8.70293 21.7533 8.91332 21.9637 9.16668 22.11C9.42003 22.2563 9.70743 22.3333 9.99997 22.3333C10.2925 22.3333 10.5799 22.2563 10.8333 22.11C11.0866 21.9637 11.297 21.7533 11.4433 21.5"
                  stroke="#CBD5E1"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2.71833 16.7717C2.60947 16.891 2.53763 17.0394 2.51155 17.1988C2.48547 17.3582 2.50627 17.5217 2.57142 17.6695C2.63658 17.8173 2.74328 17.943 2.87855 18.0312C3.01381 18.1195 3.17182 18.1665 3.33333 18.1667H16.6667C16.8282 18.1667 16.9862 18.1199 17.1216 18.0318C17.2569 17.9437 17.3637 17.8181 17.4291 17.6704C17.4944 17.5227 17.5154 17.3592 17.4895 17.1998C17.4637 17.0404 17.392 16.8919 17.2833 16.7725C16.175 15.63 15 14.4158 15 10.6667C15 9.34058 14.4732 8.06881 13.5355 7.13113C12.5979 6.19345 11.3261 5.66666 10 5.66666C8.67392 5.66666 7.40215 6.19345 6.46447 7.13113C5.52679 8.06881 5 9.34058 5 10.6667C5 14.4158 3.82417 15.63 2.71833 16.7717Z"
                  stroke="#CBD5E1"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M19 1C21.2091 1 23 2.79086 23 5C23 7.20914 21.2091 9 19 9C16.7909 9 15 7.20914 15 5C15 2.79086 16.7909 1 19 1Z"
                  fill="#EF4444"
                />
                <path
                  d="M19 1C21.2091 1 23 2.79086 23 5C23 7.20914 21.2091 9 19 9C16.7909 9 15 7.20914 15 5C15 2.79086 16.7909 1 19 1Z"
                  stroke="#0F172A"
                  stroke-width="2"
                />
              </svg>
            </button>
            <div className="mt-0.5 h-5 w-[1.5px]  bg-[#334155]" />
            <div className="flex items-center gap-3 ml-8">
              <div className="text-right leading-tight">
                <div className="text-xs font-semibold mb-1">{userName}</div>
                <div className="text-[11px] text-slate-300">{userRole}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z"
                    stroke="#CBD5E1"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M11 12C12.6569 12 14 10.6569 14 9C14 7.34315 12.6569 6 11 6C9.34315 6 8 7.34315 8 9C8 10.6569 9.34315 12 11 12Z"
                    stroke="#CBD5E1"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6 19.662V18C6 17.4696 6.21071 16.9609 6.58579 16.5858C6.96086 16.2107 7.46957 16 8 16H14C14.5304 16 15.0391 16.2107 15.4142 16.5858C15.7893 16.9609 16 17.4696 16 18V19.662"
                    stroke="#CBD5E1"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hover:text-slate-700">
              <a href="#">Dashboard</a>
            </span>
            <span className="text-slate-300">/</span>
            <span className="hover:text-slate-700">
              <a href="#">Academic</a>
            </span>
            <span className="text-slate-300">/</span>
            <span className="hover:text-slate-700">
              <a href="#">Attendance Register</a>
            </span>
            <span className="font-semibold text-slate-700"></span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button className="inline-flex items-center gap-1.5 hover:text-slate-800">
              <svg
                width="18"
                height="17"
                viewBox="0 0 18 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.82502 0C8.01132 0.00882734 6.25179 0.619066 4.82209 1.73511C3.3924 2.85115 2.37332 4.40994 1.92452 6.16725L1.37552 5.337C1.32354 5.25008 1.2545 5.17458 1.17256 5.11507C1.09062 5.05555 0.997471 5.01325 0.898736 4.99071C0.8 4.96817 0.697723 4.96586 0.598071 4.98392C0.498418 5.00197 0.403456 5.04003 0.31891 5.09579C0.234364 5.15154 0.161986 5.22384 0.106141 5.30833C0.0502954 5.39282 0.0121397 5.48774 -0.00602552 5.58737C-0.0241907 5.687 -0.0219891 5.78928 0.000446694 5.88804C0.0228825 5.9868 0.0650875 6.07999 0.124517 6.162L1.77452 8.6625C1.88913 8.82288 2.05812 8.93616 2.25002 8.98125C2.44597 9.02012 2.64935 8.98111 2.81702 8.8725L5.29202 7.20525C5.37735 7.15196 5.45109 7.08205 5.50885 6.99967C5.56661 6.91729 5.6072 6.82414 5.62822 6.72575C5.64923 6.62736 5.65023 6.52575 5.63117 6.42697C5.6121 6.32818 5.57335 6.23424 5.51723 6.15074C5.46111 6.06724 5.38876 5.99588 5.3045 5.94092C5.22023 5.88596 5.12577 5.84851 5.02673 5.8308C4.92769 5.8131 4.82611 5.8155 4.72802 5.83787C4.62993 5.86024 4.53734 5.90211 4.45577 5.961L3.33002 6.72C3.62963 5.50379 4.26506 4.39629 5.16383 3.52385C6.06259 2.65141 7.18849 2.04917 8.41307 1.78583C9.63764 1.5225 10.9116 1.60868 12.0895 2.03454C13.2675 2.4604 14.302 3.2088 15.0751 4.19433C15.8482 5.17987 16.3287 6.36286 16.4617 7.60834C16.5948 8.85382 16.3751 10.1116 15.8277 11.2383C15.2804 12.3649 14.4273 13.315 13.3659 13.9801C12.3046 14.6452 11.0776 14.9986 9.82502 15C8.75127 14.9971 7.6941 14.735 6.74338 14.2359C5.79265 13.7369 4.97649 13.0156 4.36427 12.1335C4.30944 12.0493 4.23825 11.977 4.15492 11.9208C4.0716 11.8647 3.97785 11.8258 3.87923 11.8066C3.78061 11.7874 3.67913 11.7882 3.58082 11.809C3.48252 11.8297 3.38938 11.87 3.30695 11.9275C3.22452 11.9849 3.15447 12.0584 3.10097 12.1434C3.04747 12.2285 3.0116 12.3234 2.99549 12.4226C2.97938 12.5217 2.98337 12.6231 3.00721 12.7207C3.03105 12.8183 3.07425 12.9102 3.13427 12.9907C4.12957 14.4256 5.55889 15.5034 7.21217 16.0657C8.86546 16.6279 10.6555 16.645 12.3192 16.1145C13.983 15.5839 15.4326 14.5336 16.4551 13.118C17.4777 11.7024 18.0192 9.99617 18 8.25C18.0074 6.07268 17.1509 3.98133 15.6183 2.43471C14.0858 0.888095 12.0023 0.0124997 9.82502 0Z"
                  fill="#6B7280"
                />
                <path
                  d="M9.75 3.71249C9.55109 3.71249 9.36032 3.79151 9.21967 3.93216C9.07902 4.07282 9 4.26358 9 4.46249V8.24999C9.00319 8.44825 9.08177 8.63785 9.21975 8.78024L11.4698 11.0505C11.6109 11.1895 11.8008 11.2678 11.9989 11.2688C12.197 11.2697 12.3877 11.1933 12.5303 11.0557C12.6715 10.9157 12.7512 10.7253 12.7521 10.5264C12.7529 10.3276 12.6748 10.1365 12.5347 9.99524L10.5 7.94174V4.46249C10.5 4.26358 10.421 4.07282 10.2803 3.93216C10.1397 3.79151 9.94891 3.71249 9.75 3.71249Z"
                  fill="#6B7280"
                />
              </svg>
              History
            </button>
            <button className="inline-flex items-center gap-1.5 hover:text-slate-800">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_3_54)">
                  <path
                    d="M8.14667 1.33333H7.85333C7.49971 1.33333 7.16057 1.4738 6.91053 1.72385C6.66048 1.9739 6.52 2.31304 6.52 2.66666V2.78666C6.51976 3.02048 6.45804 3.25012 6.34103 3.45255C6.22401 3.65498 6.05583 3.82309 5.85333 3.93999L5.56667 4.10666C5.36398 4.22369 5.13405 4.28529 4.9 4.28529C4.66595 4.28529 4.43603 4.22369 4.23333 4.10666L4.13333 4.05333C3.82738 3.87684 3.46389 3.82896 3.12267 3.9202C2.78145 4.01144 2.49037 4.23435 2.31333 4.53999L2.16667 4.79333C1.99018 5.09928 1.9423 5.46277 2.03354 5.80399C2.12478 6.14522 2.34769 6.43629 2.65333 6.61333L2.75333 6.67999C2.95485 6.79634 3.12241 6.96339 3.23937 7.16455C3.35632 7.36571 3.4186 7.59398 3.42 7.82666V8.16666C3.42093 8.40161 3.35977 8.63263 3.2427 8.83633C3.12563 9.04004 2.95681 9.20919 2.75333 9.32666L2.65333 9.38666C2.34769 9.5637 2.12478 9.85477 2.03354 10.196C1.9423 10.5372 1.99018 10.9007 2.16667 11.2067L2.31333 11.46C2.49037 11.7656 2.78145 11.9885 3.12267 12.0798C3.46389 12.171 3.82738 12.1232 4.13333 11.9467L4.23333 11.8933C4.43603 11.7763 4.66595 11.7147 4.9 11.7147C5.13405 11.7147 5.36398 11.7763 5.56667 11.8933L5.85333 12.06C6.05583 12.1769 6.22401 12.345 6.34103 12.5474C6.45804 12.7499 6.51976 12.9795 6.52 13.2133V13.3333C6.52 13.6869 6.66048 14.0261 6.91053 14.2761C7.16057 14.5262 7.49971 14.6667 7.85333 14.6667H8.14667C8.50029 14.6667 8.83943 14.5262 9.08948 14.2761C9.33953 14.0261 9.48 13.6869 9.48 13.3333V13.2133C9.48024 12.9795 9.54196 12.7499 9.65898 12.5474C9.77599 12.345 9.94418 12.1769 10.1467 12.06L10.4333 11.8933C10.636 11.7763 10.866 11.7147 11.1 11.7147C11.3341 11.7147 11.564 11.7763 11.7667 11.8933L11.8667 11.9467C12.1726 12.1232 12.5361 12.171 12.8773 12.0798C13.2186 11.9885 13.5096 11.7656 13.6867 11.46L13.8333 11.2C14.0098 10.894 14.0577 10.5306 13.9665 10.1893C13.8752 9.84811 13.6523 9.55703 13.3467 9.37999L13.2467 9.32666C13.0432 9.20919 12.8744 9.04004 12.7573 8.83633C12.6402 8.63263 12.5791 8.40161 12.58 8.16666V7.83333C12.5791 7.59838 12.6402 7.36736 12.7573 7.16366C12.8744 6.95995 13.0432 6.7908 13.2467 6.67333L13.3467 6.61333C13.6523 6.43629 13.8752 6.14522 13.9665 5.80399C14.0577 5.46277 14.0098 5.09928 13.8333 4.79333L13.6867 4.53999C13.5096 4.23435 13.2186 4.01144 12.8773 3.9202C12.5361 3.82896 12.1726 3.87684 11.8667 4.05333L11.7667 4.10666C11.564 4.22369 11.3341 4.28529 11.1 4.28529C10.866 4.28529 10.636 4.22369 10.4333 4.10666L10.1467 3.93999C9.94418 3.82309 9.77599 3.65498 9.65898 3.45255C9.54196 3.25012 9.48024 3.02048 9.48 2.78666V2.66666C9.48 2.31304 9.33953 1.9739 9.08948 1.72385C8.83943 1.4738 8.50029 1.33333 8.14667 1.33333Z"
                    stroke="#6B7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                    stroke="#6B7280"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_3_54">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Settings
            </button>
            <button className="inline-flex items-center gap-1.5 hover:text-slate-800">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.6666 11.3333L14 8L10.6666 4.66667"
                  stroke="#6B7280"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14 8H6"
                  stroke="#6B7280"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                  stroke="#6B7280"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex gap-6">
            <TabButton
              label="Attendance Recording"
              link="/attendance"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5 1.66667H7.5C7.03976 1.66667 6.66667 2.03977 6.66667 2.50001V4.16667C6.66667 4.62691 7.03976 5.00001 7.5 5.00001H12.5C12.9602 5.00001 13.3333 4.62691 13.3333 4.16667V2.50001C13.3333 2.03977 12.9602 1.66667 12.5 1.66667Z"
                    stroke="#1E293B"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.3333 3.33333H15C15.442 3.33333 15.8659 3.50892 16.1785 3.82148C16.4911 4.13404 16.6667 4.55797 16.6667 4.99999V16.6667C16.6667 17.1087 16.4911 17.5326 16.1785 17.8452C15.8659 18.1577 15.442 18.3333 15 18.3333H5C4.55797 18.3333 4.13405 18.1577 3.82149 17.8452C3.50893 17.5326 3.33333 17.1087 3.33333 16.6667V4.99999C3.33333 4.55797 3.50893 4.13404 3.82149 3.82148C4.13405 3.50892 4.55797 3.33333 5 3.33333H6.66667"
                    stroke="#1E293B"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10 9.16667H13.3333"
                    stroke="#1E293B"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10 13.3333H13.3333"
                    stroke="#1E293B"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6.66667 9.16667H6.675"
                    stroke="#1E293B"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6.66667 13.3333H6.675"
                    stroke="#1E293B"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
              active={activeTab === "attendance"}
              onClick={() => onTabChange?.("attendance")}
            />
            <TabButton
              label="Reports & Analytics"
              link="/reports"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 2.5V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H17.5"
                    stroke="#9CA3AF"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M15 14.1667V7.5"
                    stroke="#9CA3AF"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10.8333 14.1667V4.16667"
                    stroke="#9CA3AF"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M6.66667 14.1667V11.6667"
                    stroke="#9CA3AF"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
              active={activeTab === "reports"}
              onClick={() => onTabChange?.("reports")}
            />
            <TabButton
              label="Blacklist System"
              link="/blacklist"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_3_84)">
                    <path
                      d="M18.1083 15L11.4417 3.33333C11.2963 3.07684 11.0855 2.86349 10.8308 2.71506C10.576 2.56662 10.2865 2.48842 9.99167 2.48842C9.69685 2.48842 9.4073 2.56662 9.15257 2.71506C8.89783 2.86349 8.68703 3.07684 8.54167 3.33333L1.875 15C1.72807 15.2545 1.65103 15.5433 1.65168 15.8371C1.65233 16.1309 1.73065 16.4194 1.87871 16.6732C2.02676 16.927 2.23929 17.1372 2.49475 17.2824C2.7502 17.4276 3.03951 17.5026 3.33334 17.5H16.6667C16.9591 17.4997 17.2463 17.4225 17.4994 17.2761C17.7525 17.1297 17.9627 16.9192 18.1088 16.6659C18.2548 16.4126 18.3317 16.1253 18.3316 15.8329C18.3316 15.5405 18.2545 15.2532 18.1083 15Z"
                      stroke="#9CA3AF"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 7.5V10.8333"
                      stroke="#9CA3AF"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 14.1667H10.0083"
                      stroke="#9CA3AF"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_3_84">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              }
              active={activeTab === "blacklist"}
              onClick={() => onTabChange?.("blacklist")}
            />
          </nav>
        </div>
      </div>
    </header>
  );
}

function TabButton({
  label,
  icon,
  link,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  link: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    onClick?.();
    if (link) {
      navigate(link);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "relative flex items-center gap-2 py-3 text-xs font-medium transition",
        active ? "text-slate-900" : "text-slate-500 hover:text-slate-800",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-7 w-7 items-center justify-center rounded",
          active
            ? "bg-slate-100 text-slate-900"
            : "bg-transparent text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>

      {label}

      <span
        className={[
          "absolute bottom-0 left-0 h-0.5 w-full rounded",
          active ? "bg-slate-900" : "bg-transparent",
        ].join(" ")}
      />
    </button>
  );
}
