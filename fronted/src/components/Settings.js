import React from "react";
import { styled } from "@mui/joy/styles";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import SettingsIcon from "@mui/icons-material/Settings";

const SettingsContainer = styled("div")({
  padding: "20px",
  borderTop: "1px solid #eee",
  marginTop: "auto"
});

function Settings() {
  return (
    <SettingsContainer>
      {/* 添加设置选项 */}
      <List>
        <ListItem>
          <ListItemButton>
            <ListItemDecorator>
              <SettingsIcon />
            </ListItemDecorator>
            系统设置
          </ListItemButton>
        </ListItem>
      </List>
    </SettingsContainer>
  );
}

export default Settings; 