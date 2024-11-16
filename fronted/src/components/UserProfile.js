import React from "react";
import { styled } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";

const ProfileContainer = styled("div")({
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  alignItems: "center"
});

function UserProfileComponent() {
  return (
    <ProfileContainer>
      <Typography level="h6">USER PROFILE</Typography>
    </ProfileContainer>
  );
}

export default UserProfileComponent; 