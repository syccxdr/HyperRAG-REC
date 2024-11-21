import React from "react";
import { styled } from "@mui/joy/styles";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Avatar from "@mui/joy/Avatar";
import Typography from "@mui/joy/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

// 引入头像图片
import userAvatar from "../assets/images/avatar.webp";

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

function Settings() {
    const handleLogout = () => {
        alert("Logout clicked!");
        // 这里可以添加实际的退出逻辑，例如重定向或清除 token
    };

    return (
        <SettingsContainer>
            {/* 设置选项 */}
            <SettingsRow>
                <ListItemDecorator
                    sx={{
                        minWidth: "auto", // 避免默认宽度太大
                    }}
                >
                    <SettingsIcon
                        sx={{
                            fontSize: 36, // 设置小齿轮的大小与头像一致
                        }}
                    />
                </ListItemDecorator>
                <Typography level="body1">Settings</Typography>
            </SettingsRow>

            {/* 退出选项 */}
            <SettingsRow>
                <ListItemDecorator
                    sx={{
                        minWidth: "auto",
                    }}
                >
                    <LogoutIcon
                        sx={{
                            fontSize: 36, // 设置登出图标的大小
                        }}
                    />
                </ListItemDecorator>
                <Typography
                    level="body1"
                    sx={{ cursor: "pointer" }} // 鼠标指针变为手型
                    onClick={handleLogout}
                >
                    Logout
                </Typography>
            </SettingsRow>

            {/* 用户信息 */}
            <SettingsRow>
                <Avatar
                    src={userAvatar} // 使用头像图片
                    alt="User Avatar"
                    sx={{
                        width: 40, // 设置头像宽度
                        height: 40, // 设置头像高度
                    }}
                />
                <Typography level="body1" sx={{ fontWeight: "bold" }}>
                    HKUer
                </Typography>
            </SettingsRow>
        </SettingsContainer>
    );
}

export default Settings;