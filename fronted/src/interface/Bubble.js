import React from "react";
import clsx from "clsx";
import { styled } from "@mui/joy/styles";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip"
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PackedMarkdown from "../components/Markdown";
import assistant_female_black from '../assets/images/assistant_female_black.webp';

const PaddingDivision = styled('div')(({ theme }) => ({
  paddingBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px'
}));

const Avatar = styled('div')(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  overflow: 'hidden',
  flexShrink: 0,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const Bubble = (props) => {
  const {
    fromUser,
    content,
    attached
  } = props;

  return (
    <PaddingDivision
      sx={(theme) => ({
        maxWidth: "min(800px, 90%)",
        alignSelf: fromUser ? "flex-end" : "flex-start",
        [theme.breakpoints.only("sm")]: {
          [fromUser ? "paddingLeft" : "paddingRight"]: "min(40px, 10%)"
        },
        [theme.breakpoints.up("sm")]: {
          [fromUser ? "paddingLeft" : "paddingRight"]: "9%",
        },
        [fromUser ? "paddingRight" : "paddingLeft"]: theme.spacing(fromUser ? 1 : 2),
        flexDirection: 'row'
      })}
    >
      {!fromUser && (
        <Avatar>
          <img 
            src={assistant_female_black}
            alt="AI"
          />
        </Avatar>
      )}
      <Card
        className={clsx("markdown-body", fromUser ? "dialogue-user" : "dialogue-cpu")}
        color={fromUser ? "neutral" : "primary"}
        orientation="vertical"
        size="md"
        variant="soft"
      >
        {attached && <Chip
          color="primary"
          sx={{
            "--Chip-radius": "0px",
            padding: 0.5,
            "& .MuiChip-label": {
              display: "flex",
              alignItems: "center"
            }
          }}
        >
          <UploadFileOutlinedIcon sx={{ marginRight: 0.5 }} />
          {attached}
        </Chip>}
        <PackedMarkdown children={content} />
      </Card>
    </PaddingDivision>
  )
};

export default Bubble;
