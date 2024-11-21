import React, { useState, useEffect } from "react";
import { styled } from "@mui/joy/styles";
import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import IconButton from "@mui/joy/IconButton";

// 引入头像图片
import userAvatar from "../assets/images/avatar.webp";
import blankAvatar from "../assets/images/blank.webp"; // 引入默认的空白头像

const SettingsContainer = styled("div")({
    padding: "20px",
    borderTop: "1px solid #eee",
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // 让整个容器居中对齐
    gap: "20px", // 调整组件间的整体间距
});

const SettingsRow = styled("div")({
    display: "flex",
    alignItems: "center", // 图标和文本垂直居中
    justifyContent: "flex-start", // 左对齐内容
    width: "100%", // 宽度占满父容器
    gap: "10px", // 设置图标与文本的间隔
});

function Settings({ setSessionList }) {
    const [userName, setUserName] = useState("HKUer"); // 默认用户名
    const [avatar, setAvatar] = useState(userAvatar); // 默认头像

    const handleLogout = () => {
        alert("You have been logged out.");
        localStorage.setItem("userName", "-"); // 更新用户名为 "-"
        localStorage.setItem("userAvatar", blankAvatar); // 更新头像为空白头像
        setUserName("-"); // 更新组件状态
        setAvatar(blankAvatar); // 更新头像状态

        if (setSessionList) {
            setSessionList([]); // 确保清空对话框内容
        }
    };

    return (
        <SettingsContainer>
            {/* 设置选项 */}
            <SettingsRow>
                <IconButton
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px", // 间隔图标和文本
                        backgroundColor: "transparent", // 默认无背景颜色
                        color: "inherit", // 默认字体颜色
                        fontSize: "2rem", // 调整图标大小
                        '&:hover': {
                            backgroundColor: "#EFF3F7", // 悬停背景色
                            color: "inherit", // 悬停字体和图标颜色
                        },
                    }}
                >
                    <SettingsIcon
                        sx={{
                            fontSize: 36, // 设置小齿轮的大小
                        }}
                    />
                    <Typography
                        level="body1"
                        sx={{
                            fontSize: "16px", // 与 Logout 字体大小一致
                            fontWeight: "400", // 字重与 Logout 一致
                        }}
                    >
                        Settings
                    </Typography>
                </IconButton>
            </SettingsRow>

            {/* 退出选项 */}
            <SettingsRow>
                <IconButton
                    onClick={handleLogout}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px", // 间隔图标和文本
                        backgroundColor: "transparent", // 默认无背景颜色
                        color: "inherit", // 默认字体颜色
                        fontSize: "2rem", // 调整图标大小
                        '&:hover': {
                            backgroundColor: "#EFF3F7", // 悬停背景色
                            color: "inherit", // 悬停字体和图标颜色
                        },
                    }}
                >
                    <LogoutIcon
                        sx={{
                            fontSize: 36, // 设置登出图标大小
                        }}
                    />
                    <Typography
                        level="body1"
                        sx={{
                            fontSize: "16px", // 与 Settings 字体大小一致
                            fontWeight: "400", // 字重与 Settings 一致
                        }}
                    >
                        Logout
                    </Typography>
                </IconButton>
            </SettingsRow>

            {/* 用户信息 */}
            <SettingsRow>
                <Avatar
                    src={avatar} // 动态使用头像图片
                    alt="User Avatar"
                    sx={{
                        width: 40, // 设置头像宽度
                        height: 40, // 设置头像高度
                    }}
                />
                <Typography level="body1" sx={{ fontWeight: "bold" }}>
                    {userName}
                </Typography>
            </SettingsRow>
        </SettingsContainer>
    );
}

export default Settings;