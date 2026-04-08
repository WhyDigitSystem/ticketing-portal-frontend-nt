import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from "react-redux";
import {
    ArrowLeft,
    TrendingUp,
} from 'lucide-react';
import menuConfig from "../menu-items/index";

const MenuPage = () => {
    const navigate = useNavigate();
    const { menuName } = useParams();

    const user = useSelector((state) => state.auth.user);
    const role = user?.type?.toLowerCase();

    const config = menuConfig[menuName];

    if (!config) {
        navigate('/transporter');
        return null;
    }

    const Icon = config.icon;

    const getColorStyles = (color) => {
        const colors = {
            blue: {
                hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
                border: "hover:border-blue-300 dark:hover:border-blue-600",
                text: "text-blue-600 dark:text-blue-400",
                iconBg: "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800"
            },
            green: {
                hover: "hover:bg-green-50 dark:hover:bg-green-900/30",
                border: "hover:border-green-300 dark:hover:border-green-600",
                text: "text-green-600 dark:text-green-400",
                iconBg: "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800"
            },
            purple: {
                hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
                border: "hover:border-purple-300 dark:hover:border-purple-600",
                text: "text-purple-600 dark:text-purple-400",
                iconBg: "bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800"
            },
            orange: {
                hover: "hover:bg-orange-50 dark:hover:bg-orange-900/30",
                border: "hover:border-orange-300 dark:hover:border-orange-600",
                text: "text-orange-600 dark:text-orange-400",
                iconBg: "bg-orange-100 dark:bg-orange-900/40 group-hover:bg-orange-200 dark:group-hover:bg-orange-800"
            }
        };
        return colors[color] || colors.blue;
    };

    const filteredItems = config.items?.filter((item) => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(role);
    });

    return (
        <div className="animate-fadeIn px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    {config.title}
                                </h1>
                                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                                    {config.description}
                                </p>
                            </div>
                        </div>

                        {config.stats && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase">
                                        {config.stats.period}
                                    </p>
                                    <p className="text-sm font-bold">{config.stats.total}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-600">{config.stats.change}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {filteredItems?.map((item, index) => {
                    const ItemIcon = item.icon;
                    const colors = getColorStyles(item.color);

                    return (
                        <div
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className="group cursor-pointer animate-slideUp"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}>
                                <div className="p-3 flex flex-col items-center text-center">
                                    <div className={`p-2 rounded-lg ${colors.iconBg} mb-2`}>
                                        <ItemIcon className={`text-lg sm:text-xl md:text-2xl ${colors.text}`} />
                                    </div>
                                    <h3 className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                        {item.name}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MenuPage;