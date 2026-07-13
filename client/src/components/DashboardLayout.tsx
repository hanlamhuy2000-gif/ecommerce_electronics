import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  MenuIcon,
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";
export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
}
interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  title: string;
  role: string;
  children: React.ReactNode;
}
export function DashboardLayout({
  sidebarItems,
  title,
  role,
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{
    unreadMessagesCount: number;
    latestOrders: any[];
    latestMessages: any[];
  }>({
    unreadMessagesCount: 0,
    latestOrders: [],
    latestMessages: []
  });
  const [lastChecked, setLastChecked] = useState<string>(() => {
    return localStorage.getItem("lastCheckedNotifications") || new Date(0).toISOString();
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { settings: siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkRoles = ["Admin", "Seller", "Warehouse"];
    if (!checkRoles.includes(role)) return;

    const fetchNotifications = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed");
          return res.json();
        })
        .then(data => {
          setNotifications(data);
        })
        .catch(err => console.error("Error fetching notifications:", err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [role]);

  const newOrdersCount = notifications.latestOrders.filter(
    o => new Date(o.createdAt).getTime() > new Date(lastChecked).getTime()
  ).length;
  const badgeCount = notifications.unreadMessagesCount + newOrdersCount;

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ${isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link
            to="/"
            className={`flex items-center space-x-2 ${!isSidebarOpen && "justify-center w-full"}`}
          >
            {siteSettings.primaryLogo ? (
              <img
                src={siteSettings.primaryLogo}
                alt={siteSettings.siteName}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">
                  {siteSettings.siteName?.charAt(0) || "S"}
                </span>
              </div>
            )}
            {isSidebarOpen && (
              <span className="text-xl font-bold text-gray-900">
                {siteSettings.siteName}
              </span>
            )}
          </Link>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {isSidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {role === "Admin"
                ? "TRANG QUẢN TRỊ"
                : role === "Seller"
                  ? "KÊNH NGƯỜI BÁN"
                  : role === "Shipper"
                    ? "KÊNH GIAO HÀNG"
                    : role === "Warehouse"
                      ? "KÊNH THỦ KHO"
                      : `${role.toUpperCase()} PORTAL`}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-colors ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} ${!isSidebarOpen && "justify-center"}`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"} shrink-0`}
                />

                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={`flex items-center w-full text-gray-600 hover:text-red-600 transition-colors ${!isSidebarOpen && "justify-center"}`}
          >
            <LogOutIcon className="h-5 w-5 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 font-medium">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Dong menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-[55] bg-slate-900/40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 w-full ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-[50] flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 hidden lg:block"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">{title}</h1>
          </div>

          <div className="flex shrink-0 items-center space-x-2 sm:space-x-4">
            {/* <div className="relative hidden md:block">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
              />
            </div> */}

            {/* Notification Bell */}
            {["Admin", "Seller", "Warehouse"].includes(role) && (
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => {
                    const nextOpen = !isNotificationsOpen;
                    setIsNotificationsOpen(nextOpen);
                    if (nextOpen) {
                      const nowStr = new Date().toISOString();
                      localStorage.setItem("lastCheckedNotifications", nowStr);
                      setLastChecked(nowStr);
                    }
                  }}
                  className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0"
                  title="Thông báo"
                >
                  <BellIcon className="h-6 w-6" />
                  {badgeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {badgeCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 z-[55] mt-2 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-semibold text-gray-900 text-sm">Thông báo</h3>
                      {badgeCount > 0 && (
                        <span className="text-[11px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          {badgeCount} mới
                        </span>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                      {/* Message notification block */}
                      <div className="p-3 bg-indigo-50/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Tin nhắn mới</span>
                          {notifications.unreadMessagesCount > 0 && (
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                          )}
                        </div>
                        {notifications.unreadMessagesCount > 0 ? (
                          <Link
                            to={role === "Admin" ? "/admin/messages" : "/seller/messages"}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="block mt-1 group"
                          >
                            <p className="text-xs text-gray-700 group-hover:text-indigo-600 transition-colors">
                              Bạn có <span className="font-bold">{notifications.unreadMessagesCount}</span> tin nhắn chưa đọc trong hộp thư.
                            </p>
                            <span className="text-[10px] font-medium text-indigo-600 group-hover:underline block mt-1">
                              Đi tới hộp thư &rarr;
                            </span>
                          </Link>
                        ) : (
                          <p className="text-xs text-gray-400">Không có tin nhắn chưa đọc.</p>
                        )}
                      </div>

                      {/* Orders block */}
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Đơn hàng mới nhận</div>
                        <div className="space-y-2">
                          {notifications.latestOrders.length > 0 ? (
                            notifications.latestOrders.map((order) => {
                              const isNew = new Date(order.createdAt).getTime() > new Date(lastChecked).getTime();
                              const orderCode = order._id.toString().slice(-6).toUpperCase();
                              return (
                                <Link
                                  key={order._id}
                                  to={role === "Admin" ? "/admin/orders" : "/seller/orders"}
                                  onClick={() => setIsNotificationsOpen(false)}
                                  className={`flex items-start p-2 rounded-xl hover:bg-slate-50 transition-colors group relative ${isNew ? 'bg-indigo-50/30' : ''}`}
                                >
                                  <div className="flex items-start w-full px-1 py-0.5">
                                    {isNew && (
                                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1.5 mr-2" />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-xs text-gray-800 leading-normal">
                                        <span className="font-semibold text-gray-900">
                                          {order.customer?.name || "Khách hàng"}
                                        </span>{" "}
                                        vừa đặt đơn hàng mới <span className="font-mono font-medium text-indigo-600">#{orderCode}</span>
                                      </p>
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {getTimeAgo(order.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <p className="text-xs text-gray-400 py-1">Không có đơn hàng nào.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-100 text-center bg-slate-50/50">
                      <Link
                        to={role === "Admin" ? "/admin/orders" : "/seller/orders"}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Xem tất cả đơn hàng
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
                  alt="User avatar"
                />

                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <ChevronDownIcon className="hidden md:block h-4 w-4 text-gray-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Hồ sơ cá nhân
                  </Link>
                  {/* <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <SettingsIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Cài đặt
                  </Link> */}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOutIcon className="h-4 w-4 mr-2 text-red-500" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
